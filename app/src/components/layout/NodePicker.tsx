import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import {
  ChevronDown,
  Plus,
  Check,
  Trash2,
  Loader2,
  Wifi,
  WifiOff,
  KeyRound,
} from 'lucide-react';
import AddNodeModal from 'components/common/AddNodeModal';

const NODE_COLORS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #22c55e, #0ea5e9)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
];

const ReconnectPrompt: React.FC<{
  nodeId: string;
  onReconnect: (id: string, password: string) => void;
  onCancel: () => void;
}> = ({ nodeId, onReconnect, onCancel }) => {
  const [password, setPassword] = useState('');
  return (
    <Styled.ReconnectBox onClick={e => e.stopPropagation()}>
      <Styled.ReconnectLabel>Enter password to reconnect</Styled.ReconnectLabel>
      <Styled.ReconnectInput
        type="password"
        placeholder="Encryption password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && password.trim()) onReconnect(nodeId, password);
        }}
        autoFocus
      />
      <Styled.ReconnectActions>
        <Styled.ReconnectBtn onClick={onCancel}>Cancel</Styled.ReconnectBtn>
        <Styled.ReconnectBtnPrimary
          onClick={() => password.trim() && onReconnect(nodeId, password)}
          disabled={!password.trim()}
        >
          Connect
        </Styled.ReconnectBtnPrimary>
      </Styled.ReconnectActions>
    </Styled.ReconnectBox>
  );
};

const NodePicker: React.FC = () => {
  const { nodeStore, nodeConnectionStore } = useStore();
  const alias = nodeStore.alias || 'Lightning Node';
  const initial = alias.charAt(0).toUpperCase();

  const [open, setOpen] = useState(false);
  const [showAddNode, setShowAddNode] = useState(false);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allNodes = nodeConnectionStore.allNodes;
  const activeLeftId = nodeConnectionStore.activeLeftId;
  const activeRightId = nodeConnectionStore.activeRightId;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setReconnectingId(null);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleDeleteNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    nodeConnectionStore.removeNode(nodeId);
  };

  const handleNodeClick = (nodeId: string) => {
    const node = nodeConnectionStore.connections.get(nodeId);
    if (!node) return;

    if (node.connected) {
      if (activeLeftId === nodeId) return;
      if (activeRightId === nodeId) return;
      if (!activeRightId || activeRightId === 'primary') {
        nodeConnectionStore.setActiveRight(nodeId);
      } else {
        nodeConnectionStore.setActiveLeft(nodeId);
      }
    } else if (node.type === 'lnc' && !node.connecting) {
      setReconnectingId(nodeId);
    }
  };

  const handleReconnect = async (nodeId: string, password: string) => {
    setReconnectingId(null);
    try {
      await nodeConnectionStore.reconnectNode(nodeId, password);
    } catch {
      // error is displayed on the node item
    }
  };

  const {
    Wrapper,
    Button,
    NodeIcon,
    NodeName,
    Chevron,
    Dropdown,
    DropdownLabel,
    NodeItem,
    NodeItemIcon,
    NodeItemName,
    NodeItemCheck,
    NodeItemDelete,
    NodeItemStatus,
    AddNodeBtn,
  } = Styled;

  return (
    <Wrapper ref={dropdownRef}>
      <Button onClick={() => setOpen(!open)}>
        <NodeIcon>{initial}</NodeIcon>
        <NodeName>{alias}</NodeName>
        <Chevron open={open}>
          <ChevronDown size={14} strokeWidth={1.5} />
        </Chevron>
      </Button>

      {open && (
        <Dropdown>
          <DropdownLabel>Primary Node</DropdownLabel>
          <NodeItem active={activeLeftId === 'primary'}>
            <NodeItemIcon color={NODE_COLORS[0]} style={{ background: NODE_COLORS[0] }}>
              {initial}
            </NodeItemIcon>
            <NodeItemName>{alias}</NodeItemName>
            <NodeItemStatus online>
              <Wifi size={10} />
            </NodeItemStatus>
            {activeLeftId === 'primary' && (
              <NodeItemCheck>
                <Check size={14} />
              </NodeItemCheck>
            )}
          </NodeItem>

          {allNodes.filter(n => n.id !== 'primary').length > 0 && (
            <>
              <DropdownLabel>Additional Nodes</DropdownLabel>
              {allNodes
                .filter(n => n.id !== 'primary')
                .map((node, i) => (
                  <React.Fragment key={node.id}>
                    <NodeItem
                      active={activeLeftId === node.id || activeRightId === node.id}
                      onClick={() => handleNodeClick(node.id)}
                    >
                      <NodeItemIcon
                        style={{
                          background: NODE_COLORS[(i + 1) % NODE_COLORS.length],
                        }}
                      >
                        {node.initial}
                      </NodeItemIcon>
                      <NodeItemName>
                        {node.displayName}
                        {node.error && (
                          <NodeItemError title={node.error}>!</NodeItemError>
                        )}
                      </NodeItemName>
                      {node.connecting ? (
                        <NodeItemStatus>
                          <SpinnerIcon size={10} />
                        </NodeItemStatus>
                      ) : (
                        <NodeItemStatus online={node.connected}>
                          {node.connected ? <Wifi size={10} /> : <WifiOff size={10} />}
                        </NodeItemStatus>
                      )}
                      {!node.connected && !node.connecting && node.type === 'lnc' && (
                        <NodeItemReconnect
                          onClick={e => {
                            e.stopPropagation();
                            setReconnectingId(node.id);
                          }}
                          title="Reconnect"
                        >
                          <KeyRound size={11} />
                        </NodeItemReconnect>
                      )}
                      {(activeLeftId === node.id || activeRightId === node.id) && (
                        <NodeItemCheck>
                          <Check size={14} />
                        </NodeItemCheck>
                      )}
                      <NodeItemDelete
                        onClick={(e: React.MouseEvent) => handleDeleteNode(e, node.id)}
                      >
                        <Trash2 size={12} />
                      </NodeItemDelete>
                    </NodeItem>
                    {reconnectingId === node.id && (
                      <ReconnectPrompt
                        nodeId={node.id}
                        onReconnect={handleReconnect}
                        onCancel={() => setReconnectingId(null)}
                      />
                    )}
                  </React.Fragment>
                ))}
            </>
          )}

          <AddNodeBtn
            onClick={() => {
              setOpen(false);
              setShowAddNode(true);
            }}
          >
            <Plus size={14} />
            Add Node
          </AddNodeBtn>
        </Dropdown>
      )}

      {showAddNode && <AddNodeModal onClose={() => setShowAddNode(false)} />}
    </Wrapper>
  );
};

export default observer(NodePicker);

const SpinnerIcon = styled(Loader2)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const NodeItemError = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  font-size: 9px;
  font-weight: 700;
  margin-left: 4px;
  flex-shrink: 0;
`;

const NodeItemReconnect = styled.button`
  background: none;
  border: none;
  padding: 2px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  flex-shrink: 0;
  &:hover {
    color: #a78bfa;
    background: rgba(139, 92, 246, 0.1);
  }
`;

const Styled = {
  Wrapper: styled.div`
    padding: 16px 14px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    position: relative;
  `,
  Button: styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: ${(props: any) => props.theme.colors.white};
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease;
    letter-spacing: -0.02em;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }
  `,
  NodeIcon: styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(
      135deg,
      ${(props: any) => props.theme.colors.iris} 0%,
      ${(props: any) => props.theme.colors.purple} 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  `,
  NodeName: styled.span`
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  Chevron: styled.span<{ open?: boolean }>`
    opacity: 0.4;
    display: flex;
    align-items: center;
    transition: transform 0.15s;
    transform: ${p => (p.open ? 'rotate(180deg)' : 'none')};
  `,
  Dropdown: styled.div`
    position: absolute;
    top: calc(100% + 4px);
    left: 10px;
    right: 10px;
    background: #120e24;
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 10px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    z-index: 100;
    overflow: hidden;
  `,
  DropdownLabel: styled.div`
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
    padding: 10px 14px 4px;
  `,
  NodeItem: styled.button<{ active?: boolean }>`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border: none;
    background: ${p => (p.active ? 'rgba(139, 92, 246, 0.08)' : 'transparent')};
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: background 0.1s;
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  `,
  NodeItemIcon: styled.div<{ color?: string }>`
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: ${p => p.color || 'rgba(139, 92, 246, 0.15)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  `,
  NodeItemName: styled.span`
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
  `,
  NodeItemCheck: styled.span`
    color: #a78bfa;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  `,
  NodeItemDelete: styled.span`
    color: #475569;
    display: flex;
    align-items: center;
    opacity: 0;
    transition: opacity 0.1s;
    flex-shrink: 0;
    &:hover {
      color: #ef4444;
    }
    button:hover > & {
      opacity: 1;
    }
  `,
  NodeItemStatus: styled.span<{ online?: boolean }>`
    display: flex;
    align-items: center;
    color: ${p => (p.online ? '#22c55e' : '#64748b')};
    flex-shrink: 0;
  `,
  AddNodeBtn: styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    background: transparent;
    color: #a78bfa;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.1s;
    &:hover {
      background: rgba(139, 92, 246, 0.06);
    }
  `,
  ReconnectBox: styled.div`
    padding: 8px 14px 12px;
    background: rgba(139, 92, 246, 0.04);
    border-top: 1px solid rgba(139, 92, 246, 0.08);
  `,
  ReconnectLabel: styled.div`
    font-size: 11px;
    color: #94a3b8;
    margin-bottom: 6px;
  `,
  ReconnectInput: styled.input`
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 6px;
    padding: 7px 10px;
    color: #e2e8f0;
    font-size: 12px;
    outline: none;
    box-sizing: border-box;
    &::placeholder {
      color: #475569;
    }
    &:focus {
      border-color: rgba(139, 92, 246, 0.35);
    }
  `,
  ReconnectActions: styled.div`
    display: flex;
    gap: 6px;
    margin-top: 6px;
    justify-content: flex-end;
  `,
  ReconnectBtn: styled.button`
    padding: 5px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: transparent;
    color: #94a3b8;
    font-size: 11px;
    cursor: pointer;
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  `,
  ReconnectBtnPrimary: styled.button<{ disabled?: boolean }>`
    padding: 5px 12px;
    border-radius: 6px;
    border: none;
    background: ${p =>
      p.disabled ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.7)'};
    color: white;
    font-size: 11px;
    font-weight: 500;
    cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
    &:hover:not(:disabled) {
      background: rgba(139, 92, 246, 0.9);
    }
  `,
};
