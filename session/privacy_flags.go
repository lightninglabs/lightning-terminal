package session

import (
	"errors"
	"fmt"
	"slices"
	"strings"
)

// PrivacyFlag is an enum representing privacy flags for obfuscation behavior of
// feature configuration, feature rules and API calls. Privacy is on by default,
// by setting a privacy flag one can disable certain obfuscation behavior.
type PrivacyFlag uint64

// ErrUnknownPrivacyFlag is an error that is returned when an unknown privacy
// flag is used.
var ErrUnknownPrivacyFlag = errors.New("unknown privacy flag")

const (

	// ClearPubkeys is a privacy flag that indicates that the public node
	// ids in API should be treated as clear text.
	ClearPubkeys PrivacyFlag = 0

	// ClearAmounts is a privacy flag that indicates that the amounts in the
	// API should not be obfuscated.
	ClearAmounts PrivacyFlag = 1

	// ClearChanIDs is a privacy flag that indicates that the channel id and
	// channel points in API should not be obfuscated.
	ClearChanIDs PrivacyFlag = 2

	// ClearTimeStamps is a privacy flag that indicates that the timestamps
	// in the API should not be obfuscated.
	ClearTimeStamps PrivacyFlag = 3

	// ClearChanInitiator is a privacy flag that indicates that the channel
	// initiator in the API should not be obfuscated.
	ClearChanInitiator PrivacyFlag = 4

	// ClearHTLCs is a privacy flag that indicates that the HTLCs in the API
	// should not be obfuscated.
	ClearHTLCs PrivacyFlag = 5

	// ClearClosingTxIds is a privacy flag that indicates that the channel
	// closing transaction ids in the API should not be obfuscated.
	ClearClosingTxIds PrivacyFlag = 6
)

var flagMap = map[PrivacyFlag]string{
	ClearPubkeys:         "ClearPubkeys",
	ClearAmounts:         "ClearAmounts",
	ClearChanIDs:         "ClearChanIDs",
	ClearTimeStamps:      "ClearTimeStamps",
	ClearChanInitiator:   "ClearChanInitiator",
	ClearHTLCs:           "ClearHTLCs",
	ClearClosingTxIds:    "ClearClosingTxIds",
}

// String returns a string representation of the privacy flag.
func (f PrivacyFlag) String() string {
	flagStr, ok := flagMap[f]
	if !ok {
		return fmt.Sprintf("Unknown: %d", f)
	}

	return flagStr
}

// Validate returns an error if a privacy flag is unknown.
func (f PrivacyFlag) Validate() error {
	_, ok := flagMap[f]
	if !ok {
		return fmt.Errorf("%w: %s", ErrUnknownPrivacyFlag, f)
	}

	return nil
}

// PrivacyFlags is a struct representing a set of privacy flags.
type PrivacyFlags []PrivacyFlag

// String returns a string representation of the privacy flags.
func (f PrivacyFlags) String() string {
	// We sort to get a stable string representation without modification of
	// the original slice.
	c := make(PrivacyFlags, len(f))
	copy(c, f)
	slices.Sort(c[:])

	if len(c) == 0 {
		return ""
	}

	result := c[0].String()
	for _, flag := range c[1:] {
		result += "|"
		result += flag.String()
	}

	return result
}

// Serialize returns a serialized representation of the privacy flags.
func (f PrivacyFlags) Serialize() uint64 {
	var result uint64
	for _, flag := range f {
		result |= 1 << uint64(flag)
	}

	return result
}

// Deserialize returns a PrivacyFlags struct from a serialized
// representation.
func Deserialize(serialized uint64) (PrivacyFlags, error) {
	var flags PrivacyFlags
	for i := 0; i < 64; i++ {
		// We check if the i-th bit is set.
		if serialized&(1<<uint64(i)) != 0 {
			flag := PrivacyFlag(i)
			if err := flag.Validate(); err != nil {
				return PrivacyFlags{}, err
			}

			flags = append(flags, PrivacyFlag(i))
		}
	}

	return flags, nil
}

// Parse constructs privacy flags from its string representation.
func Parse(flags string) (PrivacyFlags, error) {
	if flags == "" {
		return PrivacyFlags{}, nil
	}

	var parsed PrivacyFlags

	flagMapReversed := make(map[string]PrivacyFlag)
	for k, v := range flagMap {
		flagMapReversed[v] = k
	}

	for _, flagStr := range strings.Split(flags, "|") {
		flag, ok := flagMapReversed[flagStr]
		if !ok {
			return nil, fmt.Errorf("%w: %s", ErrUnknownPrivacyFlag,
				flagStr)
		}
		parsed = append(parsed, flag)
	}

	return parsed, nil
}

// Contains checks if a privacy flag is contained in the set.
func (f PrivacyFlags) Contains(other PrivacyFlag) bool {
	for _, flag := range f {
		if flag == other {
			return true
		}
	}

	return false
}

// Equal checks if two sets of privacy flags are equal.
func (f PrivacyFlags) Equal(other PrivacyFlags) bool {
	return f.Serialize() == other.Serialize()
}

// Add adds a set of privacy flags to another set.
func (f PrivacyFlags) Add(other PrivacyFlags) PrivacyFlags {
	for _, flag := range other {
		if !f.Contains(flag) {
			f = append(f, flag)
		}
	}

	return f
}
