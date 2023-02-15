package firewalldb

import (
	"encoding/binary"

	"github.com/lightningnetwork/lnd/kvdb"
)

type actionPaginator struct {
	// cursor is the cursor which we are using to iterate through a bucket.
	cursor kvdb.RCursor

	// cfg is the query config which we are using to determine how to
	// iterate over the data.
	cfg *ListActionsQuery

	// filterFn is the filter function which we are using to determine which
	// actions should be included in the return list.
	filterFn ListActionsFilterFn

	// readAction is a closure which we use to read an action from the db
	// given a key value pair.
	readAction func(k, v []byte) (*Action, error)
}

// paginateActions paginates through the set of actions in the database. It
// uses the provided cursor to determine which keys to iterate over, it uses the
// provided query options to modify how the iteration is done, and it uses the
// filter function to determine which actions to include in the result.
// It returns the list of selected actions, the last index that was read from,
// and the total number of actions that matched the filter function (iff
// cfg.CountAll is set).
func paginateActions(cfg *ListActionsQuery, c kvdb.RCursor,
	readAction func(k, v []byte) (*Action, error),
	filterFn ListActionsFilterFn) ([]*Action, uint64, uint64, error) {

	if cfg == nil {
		cfg = &ListActionsQuery{}
	}

	if filterFn == nil {
		filterFn = func(a *Action, reversed bool) (bool, bool) {
			return true, true
		}
	}

	p := actionPaginator{
		cfg:        cfg,
		cursor:     c,
		readAction: readAction,
		filterFn:   filterFn,
	}

	if cfg.CountAll {
		return p.queryCountAll()
	}

	actions, lastIndex, err := p.query()

	return actions, lastIndex, 0, err
}

// keyValueForIndex seeks our cursor to a given index and returns the key and
// value at that position.
func (p *actionPaginator) keyValueForIndex(index uint64) ([]byte, []byte) {
	var keyIndex [8]byte
	byteOrder.PutUint64(keyIndex[:], index)
	return p.cursor.Seek(keyIndex[:])
}

// lastIndex returns the last value in our index, if our index is empty it
// returns 0.
func (p *actionPaginator) lastIndex() uint64 {
	keyIndex, _ := p.cursor.Last()
	if keyIndex == nil {
		return 0
	}

	return byteOrder.Uint64(keyIndex)
}

// nextKey is a helper closure to determine what key we should use next when
// we are iterating, depending on whether we are iterating forwards or in
// reverse.
func (p *actionPaginator) nextKey() ([]byte, []byte) {
	if p.cfg.Reversed {
		return p.cursor.Prev()
	}
	return p.cursor.Next()
}

// cursorStart gets the index key and value for the first item we are looking
// up, taking into account that we may be paginating in reverse. The index
// offset provided is *excusive* so we will start with the item after the offset
// for forwards queries, and the item before the index for backwards queries.
func (p *actionPaginator) cursorStart() ([]byte, []byte) {
	indexKey, indexValue := p.keyValueForIndex(p.cfg.IndexOffset + 1)

	// If the query is specifying reverse iteration, then we must
	// handle a few offset cases.
	if p.cfg.Reversed {
		switch {
		// This indicates the default case, where no offset was
		// specified. In that case we just start from the last
		// entry.
		case p.cfg.IndexOffset == 0:
			indexKey, indexValue = p.cursor.Last()

		// This indicates the offset being set to the very
		// first entry. Since there are no entries before
		// this offset, and the direction is reversed, we can
		// return without adding any invoices to the response.
		case p.cfg.IndexOffset == 1:
			return nil, nil

		// If we have been given an index offset that is beyond our last
		// index value, we just return the last indexed value in our set
		// since we are querying in reverse. We do not cover the case
		// where our index offset equals our last index value, because
		// index offset is exclusive, so we would want to start at the
		// value before our last index.
		case p.cfg.IndexOffset > p.lastIndex():
			return p.cursor.Last()

		// Otherwise we have an index offset which is within our set of
		// indexed keys, and we want to start at the item before our
		// offset. We seek to our index offset, then return the element
		// before it. We do this rather than p.indexOffset-1 to account
		// for indexes that have gaps.
		default:
			p.keyValueForIndex(p.cfg.IndexOffset)
			indexKey, indexValue = p.cursor.Prev()
		}
	}

	return indexKey, indexValue
}

// query gets the start point for our index offset and iterates through keys
// in our index until we reach the total number of items required for the query
// or we run out of cursor values. This function takes a fetchAndAppend function
// which is responsible for looking up the entry at that index, adding the entry
// to its set of return items (if desired) and return a boolean which indicates
// whether the item was added. This is required to allow the actionPaginator to
// determine when the response has the maximum number of required items.
func (p *actionPaginator) query() ([]*Action, uint64, error) {
	indexKey, indexValue := p.cursorStart()

	var (
		actions   []*Action
		lastIndex = uint64(1)
	)
	for ; indexKey != nil; indexKey, indexValue = p.nextKey() {
		// If our current return payload exceeds the max number
		// of invoices, then we'll exit now.
		if p.cfg.MaxNum != 0 &&
			uint64(len(actions)) >= p.cfg.MaxNum {

			break
		}

		lastIndex = binary.BigEndian.Uint64(indexKey)

		action, err := p.readAction(indexKey, indexValue)
		if err != nil {
			return nil, 0, err
		}

		add, cont := p.filterFn(action, p.cfg.Reversed)
		if !cont {
			break
		}

		if !add {
			continue
		}

		actions = append(actions, action)
	}

	return actions, lastIndex, nil
}

// queryCountAll is similar to query except that instead of only iterating over
// a limited set of actions (as defined by the cfg.IndexOffset and cfg.MaxNum),
// it will instead iterate through all actions so that it can count the total
// number of actions that match the filter function. It will however only
// return actions in the range specified by the cfg.IndexOffset and cfg.MaxNum.
// Callers should be aware that this is a much slower function than query if
// there are a large number of actions in the database.
func (p *actionPaginator) queryCountAll() ([]*Action, uint64, uint64, error) {
	// Start at the very first, or very last item.
	indexKey, indexValue := p.cursor.First()
	if p.cfg.Reversed {
		indexKey, indexValue = p.cursor.Last()
	}
	// Then iterate from first to last and check each action. If passes
	// filter, increment total count. Only if the current index is after
	// (or before (in reverse mode)) the offset do we add the action & that
	// is only if the num we have collected is below MaxNum.

	var (
		actions           []*Action
		lastIndex         = uint64(1)
		beforeIndexOffset = p.cfg.IndexOffset != 0
		totalCount        uint64
	)
	for ; indexKey != nil; indexKey, indexValue = p.nextKey() {
		action, err := p.readAction(indexKey, indexValue)
		if err != nil {
			return nil, 0, 0, err
		}

		add, cont := p.filterFn(action, p.cfg.Reversed)
		if !cont {
			break
		}

		if !add {
			continue
		}

		totalCount++

		if p.cfg.IndexOffset != 0 &&
			binary.BigEndian.Uint64(indexKey) == p.cfg.IndexOffset+1 {

			beforeIndexOffset = false
		}

		// Don't add the action if we are still before the offset.
		if beforeIndexOffset {
			continue
		}

		// If our current return payload exceeds the max number
		// of invoices, then we continue without adding the action to
		// our return list.
		if p.cfg.MaxNum != 0 &&
			uint64(len(actions)) >= p.cfg.MaxNum {

			continue
		}

		lastIndex = binary.BigEndian.Uint64(indexKey)
		actions = append(actions, action)
	}

	return actions, lastIndex, totalCount, nil
}
