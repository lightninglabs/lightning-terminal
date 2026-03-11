import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import { ChevronDown, Plus, Check, Trash2 } from 'lucide-react';
import AddNodeModal, { SavedNode } from 'components/common/AddNodeModal';

const STORAGE_KEY = 'lit-saved-nodes';

function loadNodes(): SavedNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNodes(nodes: SavedNode[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
}

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
  `,
  NodeItemCheck: styled.span`
    color: #a78bfa;
    display: flex;
    align-items: center;
  `,
  NodeItemDelete: styled.span`
    color: #475569;
    display: flex;
    align-items: center;
    opacity: 0;
    transition: opacity 0.1s;
    &:hover {
      color: #ef4444;
    }
    button:hover > & {
      opacity: 1;
    }
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
};

const NODE_COLORS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #22c55e, #0ea5e9)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
];

const NodePicker: React.FC = () => {
  const { nodeStore } = useStore();
  const alias = nodeStore.alias || 'Lightning Node';
  const initial = alias.charAt(0).toUpperCase();

  const [open, setOpen] = useState(false);
  const [showAddNode, setShowAddNode] = useState(false);
  const [savedNodes, setSavedNodes] = useState<SavedNode[]>(loadNodes);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleAddNode = (node: SavedNode) => {
    const updated = [...savedNodes, node];
    setSavedNodes(updated);
    saveNodes(updated);
  };

  const handleDeleteNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const updated = savedNodes.filter(n => n.id !== nodeId);
    setSavedNodes(updated);
    saveNodes(updated);
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
          <DropdownLabel>Connected</DropdownLabel>
          <NodeItem active>
            <NodeItemIcon color={NODE_COLORS[0]} style={{ background: NODE_COLORS[0] }}>
              {initial}
            </NodeItemIcon>
            <NodeItemName>{alias}</NodeItemName>
            <NodeItemCheck>
              <Check size={14} />
            </NodeItemCheck>
          </NodeItem>

          {savedNodes.length > 0 && (
            <>
              <DropdownLabel>Saved Nodes</DropdownLabel>
              {savedNodes.map((node, i) => (
                <NodeItem key={node.id}>
                  <NodeItemIcon
                    style={{
                      background: NODE_COLORS[(i + 1) % NODE_COLORS.length],
                    }}
                  >
                    {node.alias.charAt(0).toUpperCase()}
                  </NodeItemIcon>
                  <NodeItemName>{node.alias}</NodeItemName>
                  <NodeItemDelete
                    onClick={(e: React.MouseEvent) => handleDeleteNode(e, node.id)}
                  >
                    <Trash2 size={12} />
                  </NodeItemDelete>
                </NodeItem>
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

      {showAddNode && (
        <AddNodeModal onClose={() => setShowAddNode(false)} onSave={handleAddNode} />
      )}
    </Wrapper>
  );
};

export default observer(NodePicker);
