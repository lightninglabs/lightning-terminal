import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error - three.js types require newer TS
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  Link2,
  X,
  Loader2,
  ExternalLink,
  Search,
  List,
} from 'lucide-react';
import { ChannelStatus } from 'types/state';
import { useStore } from 'store';
import TransactionModal from 'components/common/TransactionModal';
import OpenChannelModal from 'components/common/OpenChannelModal';
import SplitNodeView from './SplitNodeView';

interface NodeData {
  id: string;
  alias: string;
  x: number;
  y: number;
  z: number;
  isCenter: boolean;
  capacity: number;
  color: string;
  channelCount: number;
}

interface EdgeData {
  from: NodeData;
  to: NodeData;
  capacity: number;
  active: boolean;
  localBalance: number;
  remoteBalance: number;
}

// #region Styled Components
const S = {
  Wrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at 50% 50%, #0a0d14 0%, #050709 100%);
    overflow: hidden;
  `,
  Canvas: styled.canvas`
    display: block;
    width: 100%;
    height: 100%;
  `,
  HoverCard: styled.div<{ visible: boolean }>`
    position: fixed;
    pointer-events: none;
    background: rgba(6, 8, 14, 0.92);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(167, 139, 250, 0.1);
    border-radius: 10px;
    padding: 12px 16px;
    min-width: 200px;
    opacity: ${p => (p.visible ? 1 : 0)};
    transition: opacity 0.12s ease;
    z-index: 100;
  `,
  HoverTitle: styled.div`
    font-weight: 600;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 6px;
    letter-spacing: -0.01em;
  `,
  HoverRow: styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 3px;
    span:last-child {
      color: rgba(255, 255, 255, 0.75);
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
  `,
  HoverHint: styled.div`
    font-size: 10px;
    color: rgba(167, 139, 250, 0.5);
    margin-top: 6px;
    font-style: italic;
  `,
  HoverDivider: styled.div`
    height: 1px;
    background: rgba(255, 255, 255, 0.05);
    margin: 6px 0;
  `,
  Overlay: styled.div`
    position: absolute;
    bottom: 24px;
    left: 24px;
    right: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    pointer-events: none;
    z-index: 10;
  `,
  Stats: styled.div`
    display: flex;
    gap: 16px;
    pointer-events: auto;
  `,
  StatCard: styled.div`
    background: rgba(6, 8, 14, 0.7);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 10px;
    padding: 10px 14px;
    min-width: 110px;
  `,
  StatLabel: styled.div`
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 3px;
  `,
  StatValue: styled.div`
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  `,
  CTASection: styled.div`
    display: flex;
    gap: 8px;
    pointer-events: auto;
  `,
  CTAButton: styled.button<{ variant?: 'primary' | 'secondary' }>`
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    ${p =>
      p.variant === 'primary'
        ? `
      background: rgba(139, 92, 246, 0.7);
      color: white;
      &:hover { background: rgba(139, 92, 246, 0.9); }
    `
        : `
      background: rgba(255, 255, 255, 0.03);
      color: rgba(255, 255, 255, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.06);
      &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.85);
      }
    `}
  `,
  LoadingOverlay: styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.35);
    font-size: 13px;
    z-index: 15;
  `,
  Spinner: styled.div`
    animation: gspin 1s linear infinite;
    @keyframes gspin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
  DetailPanel: styled.div<{ visible: boolean }>`
    position: absolute;
    top: 16px;
    right: 16px;
    width: 300px;
    max-height: calc(100% - 32px);
    overflow-y: auto;
    background: rgba(6, 8, 14, 0.94);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(167, 139, 250, 0.08);
    border-radius: 14px;
    padding: 20px;
    z-index: 30;
    transform: translateX(${p => (p.visible ? '0' : '320px')});
    opacity: ${p => (p.visible ? 1 : 0)};
    transition: transform 0.25s ease, opacity 0.2s ease;
    pointer-events: ${p => (p.visible ? 'auto' : 'none')};
  `,
  DetailClose: styled.button`
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.35);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
    }
  `,
  DetailAlias: styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0 0 4px;
    padding-right: 28px;
    word-break: break-word;
  `,
  DetailPubkey: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 16px;
    word-break: break-all;
    line-height: 1.5;
  `,
  CopyBtn: styled.button`
    flex-shrink: 0;
    background: none;
    border: none;
    color: #a78bfa;
    cursor: pointer;
    padding: 2px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    &:hover {
      color: #c4b5fd;
    }
  `,
  DetailDivider: styled.div`
    height: 1px;
    background: rgba(255, 255, 255, 0.05);
    margin: 14px 0;
  `,
  DetailRow: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  `,
  DetailLabel: styled.span`
    font-size: 11px;
    color: rgba(255, 255, 255, 0.35);
    font-weight: 500;
  `,
  DetailValue: styled.span`
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  `,
  DetailColorDot: styled.span<{ nodeColor: string }>`
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${p => p.nodeColor};
    box-shadow: 0 0 6px ${p => p.nodeColor};
    margin-right: 6px;
    vertical-align: middle;
  `,
  DetailActions: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  `,
  DetailActionBtn: styled.button<{ primary?: boolean }>`
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: ${p => (p.primary ? 'none' : '1px solid rgba(255,255,255,0.06)')};
    background: ${p => (p.primary ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.03)')};
    color: ${p => (p.primary ? 'white' : 'rgba(255,255,255,0.55)')};
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.15s ease;
    &:hover {
      background: ${p => (p.primary ? 'rgba(139,92,246,0.9)' : 'rgba(255,255,255,0.06)')};
      color: ${p => (p.primary ? 'white' : 'rgba(255,255,255,0.85)')};
    }
  `,
  NetworkLabel: styled.div`
    position: absolute;
    top: 56px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    color: rgba(255, 255, 255, 0.2);
    z-index: 20;
    letter-spacing: 0.02em;
  `,
  NodeListToggle: styled.button`
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    background: rgba(6, 8, 12, 0.85);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    &:hover {
      color: rgba(255, 255, 255, 0.8);
      border-color: rgba(255, 255, 255, 0.12);
    }
  `,
  NodeListPanel: styled.div<{ open: boolean }>`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    z-index: 25;
    background: rgba(6, 8, 14, 0.95);
    backdrop-filter: blur(24px);
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    transform: translateX(${p => (p.open ? '0' : '-300px')});
    opacity: ${p => (p.open ? 1 : 0)};
    transition: transform 0.25s ease, opacity 0.2s ease;
    pointer-events: ${p => (p.open ? 'auto' : 'none')};
  `,
  NodeListHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  `,
  NodeListTitle: styled.div`
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  `,
  NodeListClose: styled.button`
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
    }
  `,
  NodeSearchBox: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 12px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
  `,
  NodeSearchInput: styled.input`
    flex: 1;
    background: none;
    border: none;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    outline: none;
    &::placeholder {
      color: rgba(255, 255, 255, 0.25);
    }
  `,
  NodeListScroll: styled.div`
    flex: 1;
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 2px;
    }
  `,
  NodeRow: styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 16px;
    cursor: pointer;
    transition: background 0.1s ease;
    &:hover {
      background: rgba(255, 255, 255, 0.04);
    }
  `,
  NodeRowRank: styled.span`
    font-size: 10px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.25);
    width: 22px;
    text-align: right;
    flex-shrink: 0;
  `,
  NodeRowDot: styled.span<{ c: string }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${p => p.c};
    flex-shrink: 0;
  `,
  NodeRowInfo: styled.div`
    flex: 1;
    min-width: 0;
  `,
  NodeRowAlias: styled.div`
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  NodeRowMeta: styled.div`
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    font-variant-numeric: tabular-nums;
  `,
};
// #endregion

const formatSats = (sats: number) => {
  if (sats >= 100000000) {
    const btc = sats / 100000000;
    return `${Math.round(btc).toLocaleString()} BTC`;
  }
  if (sats >= 1000000) {
    const m = sats / 1000000;
    return `${Math.round(m).toLocaleString()}M sats`;
  }
  return `${sats.toLocaleString()} sats`;
};

const GraphVisualization: React.FC = observer(() => {
  const {
    channelStore,
    nodeStore,
    networkGraphStore,
    nodeConnectionStore,
    paymentActivityStore,
    appView,
  } = useStore();

  if (
    appView.graphViewMode === 'mynode' &&
    nodeConnectionStore.hasMultipleConnected &&
    nodeConnectionStore.activeRight
  ) {
    return <SplitNodeView />;
  }
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    group: THREE.Group;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    nodeMeshes: Map<string, { mesh: THREE.Mesh; data: NodeData }>;
    edgeLines: Array<{ line: THREE.Line; data: EdgeData }>;
    starMaterials: THREE.PointsMaterial[];
    animationId: number;
    isPaused: boolean;
    isDragging: boolean;
    userControlled: boolean;
    dragStart: { x: number; y: number };
    resumeTimer: ReturnType<typeof setTimeout>;
  } | null>(null);

  const viewMode = appView.graphViewMode;
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<EdgeData | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [copiedPubkey, setCopiedPubkey] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showOpenChannel, setShowOpenChannel] = useState(false);
  const [openChannelTarget, setOpenChannelTarget] = useState<{
    pubkey: string;
    alias: string;
  } | null>(null);
  const [nodeListOpen, setNodeListOpen] = useState(false);
  const [nodeSearch, setNodeSearch] = useState('');

  useEffect(() => {
    if (viewMode === 'network' && networkGraphStore.nodes.length === 0) {
      networkGraphStore.fetchGraph();
    }
  }, [viewMode, networkGraphStore]);

  // My Node ego-graph from channel store
  const myNodeGraph = useMemo(() => {
    const channels = channelStore.sortedChannels;
    const selfPk = nodeStore.pubkey || 'self';
    const center: NodeData = {
      id: selfPk,
      alias: nodeStore.alias || 'My Node',
      x: 0,
      y: 0,
      z: 0,
      isCenter: true,
      capacity: 0,
      color: '#c4b5fd',
      channelCount: channels.length,
    };

    const peers: NodeData[] = [];
    const edgs: EdgeData[] = [];
    const seen = new Set<string>();

    channels.forEach((ch, i) => {
      const pid = ch.remotePubkey;
      if (seen.has(pid)) return;
      seen.add(pid);
      const a = (i / Math.max(channels.length, 1)) * Math.PI * 2;
      const r = 2.5 + Math.random() * 2;
      const yo = (Math.random() - 0.5) * 2;
      const peer: NodeData = {
        id: pid,
        alias: ch.aliasLabel || pid.substring(0, 12) + '...',
        x: Math.cos(a) * r,
        y: yo,
        z: Math.sin(a) * r,
        isCenter: false,
        capacity: ch.capacity.toNumber(),
        color: '#8b5cf6',
        channelCount: 1,
      };
      peers.push(peer);
      edgs.push({
        from: center,
        to: peer,
        capacity: ch.capacity.toNumber(),
        active: ch.status === ChannelStatus.OPEN,
        localBalance: ch.localBalance.toNumber(),
        remoteBalance: ch.remoteBalance.toNumber(),
      });
    });

    return { nodes: [center, ...peers], edges: edgs };
  }, [channelStore.sortedChannels, nodeStore.alias, nodeStore.pubkey]);

  // Network graph — pure starfield from real mempool data, no edges
  const networkGraph = useMemo(() => {
    if (networkGraphStore.nodes.length === 0) {
      return {
        nodes: [] as NodeData[],
        edges: [] as EdgeData[],
      };
    }

    const selfPk = nodeStore.pubkey || '';
    const mData = networkGraphStore.mempoolData;
    const count = networkGraphStore.nodes.length;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    const nds: NodeData[] = networkGraphStore.nodes.map((n, i) => {
      const md = mData.get(n.pubKey);
      const isSelf = n.pubKey === selfPk;
      const t = goldenAngle * i;
      const yNorm = 1 - (2 * i) / (count - 1 || 1);
      const radY = Math.sqrt(1 - yNorm * yNorm);
      const spread = 6 + (i % 5) * 0.4;

      return {
        id: n.pubKey,
        alias: n.alias || n.pubKey.substring(0, 12) + '...',
        x: isSelf ? 0 : Math.cos(t) * radY * spread,
        y: isSelf ? 0 : yNorm * spread * 0.6,
        z: isSelf ? 0 : Math.sin(t) * radY * spread,
        isCenter: isSelf,
        capacity: md?.capacity || 0,
        color: isSelf ? '#c4b5fd' : n.color || '#8b5cf6',
        channelCount: md?.channels || 0,
      };
    });

    return { nodes: nds, edges: [] as EdgeData[] };
  }, [networkGraphStore.nodes, networkGraphStore.mempoolData, nodeStore.pubkey]);

  const { nodes, edges } = viewMode === 'mynode' ? myNodeGraph : networkGraph;

  const totalCap =
    viewMode === 'mynode'
      ? edges.reduce((s, e) => s + e.capacity, 0)
      : nodes.reduce((s, n) => s + n.capacity, 0);
  const totalIn =
    viewMode === 'mynode' ? edges.reduce((s, e) => s + e.remoteBalance, 0) : 0;
  const totalOut =
    viewMode === 'mynode' ? edges.reduce((s, e) => s + e.localBalance, 0) : 0;
  const activeCh = edges.filter(e => e.active).length;

  // ===== THREE.JS SCENE — Stars in Space =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(
      50,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      500,
    );
    const camZ = viewMode === 'network' ? 16 : 10;
    cam.position.set(0, 1, camZ);
    cam.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x030508, 1);

    const group = new THREE.Group();
    scene.add(group);

    scene.add(new THREE.AmbientLight(0x8080a0, 0.3));
    const dl = new THREE.DirectionalLight(0xc4b5fd, 0.15);
    dl.position.set(5, 10, 8);
    scene.add(dl);

    const nodeMeshes = new Map<string, { mesh: THREE.Mesh; data: NodeData }>();
    const edgeLines: Array<{
      line: THREE.Line;
      data: EdgeData;
    }> = [];
    const starMats: THREE.PointsMaterial[] = [];

    // ---- Background starfield with slow drift ----
    const starGroup = new THREE.Group();
    scene.add(starGroup);

    const bgN = 2500;
    const bgArr = new Float32Array(bgN * 3);
    for (let i = 0; i < bgN; i++) {
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      const r = 40 + Math.random() * 120;
      bgArr[i * 3] = r * Math.sin(p) * Math.cos(t);
      bgArr[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      bgArr[i * 3 + 2] = r * Math.cos(p);
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgArr, 3));
    const bgMat = new THREE.PointsMaterial({
      color: 0xc0c8e0,
      size: 0.12,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    });
    starGroup.add(new THREE.Points(bgGeo, bgMat));

    // Nearer dust for depth
    const dustN = 600;
    const dustArr = new Float32Array(dustN * 3);
    for (let i = 0; i < dustN; i++) {
      dustArr[i * 3] = (Math.random() - 0.5) * 35;
      dustArr[i * 3 + 1] = (Math.random() - 0.5) * 35;
      dustArr[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustArr, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x6d28d9,
      size: 0.025,
      transparent: true,
      opacity: 0.1,
      sizeAttenuation: true,
    });
    group.add(new THREE.Points(dustGeo, dustMat));

    // ---- Orbit data for mynode peers ----
    const isMyNode = viewMode === 'mynode';
    interface OrbitInfo {
      angle: number;
      radius: number;
      yOffset: number;
      speed: number;
      core: THREE.Mesh;
      glow: THREE.Mesh;
      hit: THREE.Mesh;
      nodeId: string;
      edgeIdx: number;
    }
    const orbitNodes: OrbitInfo[] = [];

    // ---- Constellation edges (My Node only) — brighter ----
    if (isMyNode) {
      edges.forEach(edge => {
        const pts = [
          new THREE.Vector3(edge.from.x, edge.from.y, edge.from.z),
          new THREE.Vector3(edge.to.x, edge.to.y, edge.to.z),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
          color: edge.active ? 0xa78bfa : 0x3f3f5a,
          transparent: true,
          opacity: edge.active ? 0.45 : 0.12,
        });
        const line = new THREE.Line(geo, mat);
        group.add(line);
        edgeLines.push({ line, data: edge });
      });
    }

    // ---- Lightning bolt pool (synced with explorer params) ----
    const BOLT_COUNT = isMyNode ? 6 : 4;
    const BOLT_SEGS = 48;
    const bolts: Array<{
      line: THREE.Line;
      glowPts: THREE.Points;
      fromPos: THREE.Vector3;
      toPos: THREE.Vector3;
      progress: number;
      speed: number;
      alive: boolean;
      targetId: string;
    }> = [];

    const nodeFlashes = new Map<
      string,
      {
        core: THREE.MeshBasicMaterial;
        glow: THREE.MeshBasicMaterial;
        baseColor: number;
        baseGlowOp: number;
        baseCoreOp: number;
        t: number;
      }
    >();

    const canFire = isMyNode ? edges.length > 0 : nodes.length > 1;
    if (canFire) {
      for (let i = 0; i < BOLT_COUNT; i++) {
        const vCount = BOLT_SEGS + 1;
        const lPos = new Float32Array(vCount * 3);
        const lCol = new Float32Array(vCount * 3);
        const lGeo = new THREE.BufferGeometry();
        lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
        lGeo.setAttribute('color', new THREE.BufferAttribute(lCol, 3));
        const lMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const line = new THREE.Line(lGeo, lMat);
        line.visible = false;
        group.add(line);

        const gPos = new Float32Array(vCount * 3);
        const gCol = new Float32Array(vCount * 3);
        const gGeo = new THREE.BufferGeometry();
        gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
        gGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
        const gMat = new THREE.PointsMaterial({
          vertexColors: true,
          size: 0.1,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const glowPts = new THREE.Points(gGeo, gMat);
        glowPts.visible = false;
        group.add(glowPts);

        bolts.push({
          line,
          glowPts,
          fromPos: new THREE.Vector3(),
          toPos: new THREE.Vector3(),
          progress: 0,
          speed: 0,
          alive: false,
          targetId: '',
        });
      }
    }

    const getNodePos = (nodeId: string): THREE.Vector3 => {
      const orbit = orbitNodes.find(o => o.nodeId === nodeId);
      if (orbit) return orbit.core.position.clone();
      const entry = nodeMeshes.get(nodeId);
      if (entry) return entry.mesh.position.clone();
      return new THREE.Vector3(0, 0, 0);
    };

    const fireBolt = (eventDir?: 'send' | 'receive') => {
      const idle = bolts.find(b => !b.alive);
      if (!idle) return;
      let fromId: string;
      let toId: string;
      if (isMyNode && edges.length > 0) {
        const edge = edges[Math.floor(Math.random() * edges.length)];
        if (eventDir === 'send') {
          fromId = edge.from.id;
          toId = edge.to.id;
        } else if (eventDir === 'receive') {
          fromId = edge.to.id;
          toId = edge.from.id;
        } else {
          const rev = Math.random() > 0.5;
          fromId = rev ? edge.to.id : edge.from.id;
          toId = rev ? edge.from.id : edge.to.id;
        }
      } else if (nodes.length > 1) {
        const a = Math.floor(Math.random() * nodes.length);
        let b = Math.floor(Math.random() * (nodes.length - 1));
        if (b >= a) b++;
        fromId = nodes[a].id;
        toId = nodes[b].id;
      } else {
        return;
      }
      const fromPos = getNodePos(fromId);
      const toPos = getNodePos(toId);
      idle.fromPos.copy(fromPos);
      idle.toPos.copy(toPos);

      const dir = idle.toPos.clone().sub(idle.fromPos);
      const len = dir.length();
      dir.normalize();
      const ref =
        Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      const p1 = new THREE.Vector3().crossVectors(dir, ref).normalize();
      const p2 = new THREE.Vector3().crossVectors(dir, p1).normalize();

      const lAttr = idle.line.geometry.attributes.position as THREE.BufferAttribute;
      const gAttr = idle.glowPts.geometry.attributes.position as THREE.BufferAttribute;
      const jitter = len * 0.08;

      for (let i = 0; i <= BOLT_SEGS; i++) {
        const u = i / BOLT_SEGS;
        const pt = idle.fromPos.clone().lerp(idle.toPos, u);
        if (i > 0 && i < BOLT_SEGS) {
          const j = jitter * (1 - Math.abs(u - 0.5) * 2) * 0.6;
          pt.addScaledVector(p1, (Math.random() - 0.5) * j);
          pt.addScaledVector(p2, (Math.random() - 0.5) * j);
        }
        lAttr.setXYZ(i, pt.x, pt.y, pt.z);
        gAttr.setXYZ(i, pt.x, pt.y, pt.z);
      }
      lAttr.needsUpdate = true;
      gAttr.needsUpdate = true;

      idle.progress = 0;
      idle.speed = 0.6 + Math.random() * 0.4;
      idle.alive = true;
      idle.targetId = toId;
      idle.line.visible = true;
      idle.glowPts.visible = true;
    };

    // ---- Star nodes (log-scale sizing) ----
    const hexToInt = (h: string) => parseInt(h.replace('#', ''), 16) || 0x8b5cf6;

    const caps = nodes.map(n => n.capacity).filter(c => c > 0);
    const logMin = caps.length > 0 ? Math.log(Math.min(...caps) + 1) : 0;
    const logMax = caps.length > 0 ? Math.log(Math.max(...caps) + 1) : 1;
    const logRange = logMax - logMin || 1;

    nodes.forEach((node, nodeIdx) => {
      const logCap = node.capacity > 0 ? Math.log(node.capacity + 1) : 0;
      const capNorm = (logCap - logMin) / logRange;

      const starR = node.isCenter
        ? 0.12
        : isMyNode
        ? 0.02 + capNorm * 0.06
        : 0.015 + capNorm * 0.07;

      const col = hexToInt(node.color);

      const coreGeo = new THREE.SphereGeometry(starR, 12, 12);
      const coreMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: node.isCenter ? 1.0 : 0.85,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(node.x, node.y, node.z);
      group.add(core);

      const glowMul = node.isCenter ? 3.5 : 2.0 + capNorm * 1.5;
      const glowGeo = new THREE.SphereGeometry(starR * glowMul, 12, 12);
      const glowMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: node.isCenter ? 0.07 : 0.02 + capNorm * 0.03,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(node.x, node.y, node.z);
      group.add(glow);

      nodeFlashes.set(node.id, {
        core: coreMat,
        glow: glowMat,
        baseColor: col,
        baseGlowOp: glowMat.opacity,
        baseCoreOp: coreMat.opacity,
        t: 0,
      });

      if (node.isCenter) {
        const aGeo = new THREE.SphereGeometry(starR * 7, 16, 16);
        const aMat = new THREE.MeshBasicMaterial({
          color: 0x7c3aed,
          transparent: true,
          opacity: 0.02,
        });
        const aura = new THREE.Mesh(aGeo, aMat);
        aura.position.set(node.x, node.y, node.z);
        group.add(aura);
      }

      const hitR = Math.max(starR * 2.5, 0.2);
      const hitGeo = new THREE.SphereGeometry(hitR, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hit = new THREE.Mesh(hitGeo, hitMat);
      hit.position.set(node.x, node.y, node.z);
      group.add(hit);
      nodeMeshes.set(node.id, { mesh: hit, data: node });

      // Track orbit info for non-center mynode peers
      if (isMyNode && !node.isCenter) {
        const r = Math.sqrt(node.x * node.x + node.z * node.z);
        const a = Math.atan2(node.z, node.x);
        const edgeIdx = edgeLines.findIndex(e => e.data.to.id === node.id);
        const dir = nodeIdx % 2 === 0 ? 1 : -1;
        const speedVariation = dir * (0.12 + Math.random() * 0.08);
        orbitNodes.push({
          angle: a,
          radius: r,
          yOffset: node.y,
          speed: speedVariation,
          core,
          glow,
          hit,
          nodeId: node.id,
          edgeIdx,
        });
      }
    });

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const state = {
      scene,
      camera: cam,
      renderer,
      group,
      raycaster,
      mouse,
      nodeMeshes,
      edgeLines,
      starMaterials: starMats,
      animationId: 0,
      isPaused: false,
      isDragging: false,
      userControlled: false,
      dragStart: { x: 0, y: 0 },
      resumeTimer: (0 as unknown) as ReturnType<typeof setTimeout>,
    };
    sceneRef.current = state;

    // ---- Interaction ----
    const onDown = (e: MouseEvent) => {
      state.isDragging = true;
      state.dragStart = { x: e.clientX, y: e.clientY };
      state.userControlled = true;
      state.isPaused = true;
      clearTimeout(state.resumeTimer);
    };
    const onMove = (e: MouseEvent) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.dragStart.x;
      const dy = e.clientY - state.dragStart.y;
      group.rotation.y += dx * 0.004;
      group.rotation.x += dy * 0.004;
      state.dragStart = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      state.resumeTimer = setTimeout(() => {
        state.userControlled = false;
        state.isPaused = false;
      }, 3000);
    };

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    // ---- Animation loop ----
    const clock = new THREE.Clock();
    let nextBoltTime = 1.5 + Math.random() * 2.0;
    const animate = () => {
      state.animationId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.elapsedTime;

      const shouldAnimate = !state.isPaused && !state.userControlled;

      // Subtle star background drift (always moves, like homepage)
      starGroup.rotation.y += 0.00008;
      starGroup.rotation.x += 0.00003;

      // Slow drift rotation for node group
      if (shouldAnimate) {
        group.rotation.y += 0.00015;
        group.rotation.x += 0.00005;
      }

      // Orbit peer nodes around center (mynode mode)
      if (isMyNode) {
        for (const orb of orbitNodes) {
          if (shouldAnimate) {
            orb.angle += orb.speed * dt;
          }
          const nx = Math.cos(orb.angle) * orb.radius;
          const nz = Math.sin(orb.angle) * orb.radius;
          const bobY = orb.yOffset + Math.sin(t * 0.5 + orb.angle * 2) * 0.15;
          orb.core.position.set(nx, bobY, nz);
          orb.glow.position.set(nx, bobY, nz);
          orb.hit.position.set(nx, bobY, nz);

          // Update the corresponding edge line to follow
          if (orb.edgeIdx >= 0 && orb.edgeIdx < edgeLines.length) {
            const posAttr = edgeLines[orb.edgeIdx].line.geometry.attributes
              .position as THREE.BufferAttribute;
            posAttr.setXYZ(1, nx, bobY, nz);
            posAttr.needsUpdate = true;
          }
        }
      }

      // Channel edge gentle pulse (My Node only) — brighter base
      edgeLines.forEach(({ line, data }, idx) => {
        if (data.active) {
          const m = line.material as THREE.LineBasicMaterial;
          const ph = idx * 1.7 + data.capacity * 0.00001;
          m.opacity =
            0.35 + Math.sin(t * 0.5 + ph) * 0.1 + Math.sin(t * 1.3 + ph * 0.3) * 0.05;
        }
      });

      // Lightning bolt animations (explorer-matched timing)
      if (bolts.length > 0) {
        if (isMyNode) {
          const ev = paymentActivityStore.dequeue();
          if (ev) {
            fireBolt(ev.direction);
          } else {
            nextBoltTime -= dt;
            if (nextBoltTime <= 0) {
              fireBolt();
              nextBoltTime = 2.5 + Math.random() * 3.5;
            }
          }
        } else {
          nextBoltTime -= dt;
          if (nextBoltTime <= 0) {
            fireBolt();
            nextBoltTime = 2.5 + Math.random() * 3.5;
          }
        }

        for (const bolt of bolts) {
          if (!bolt.alive) continue;
          bolt.progress += bolt.speed * dt;

          if (bolt.progress >= 1.3) {
            bolt.alive = false;
            bolt.line.visible = false;
            bolt.glowPts.visible = false;
            continue;
          }

          if (bolt.progress >= 0.97) {
            const nf = nodeFlashes.get(bolt.targetId);
            if (nf && nf.t < 0.3) nf.t = 1.0;
          }

          // Purple-tinted bolt colors (matched to explorer)
          const cAttr = bolt.line.geometry.attributes.color as THREE.BufferAttribute;
          const gcAttr = bolt.glowPts.geometry.attributes.color as THREE.BufferAttribute;

          for (let i = 0; i <= BOLT_SEGS; i++) {
            const u = i / BOLT_SEGS;
            const dist = Math.abs(u - bolt.progress);
            const headW = 0.35;
            const bright = Math.max(0, 1 - dist / headW);
            const fade = Math.pow(bright, 1.5);
            const r = 0.35 + fade * 0.2;
            const g = 0.15 + fade * 0.15;
            const b2 = 0.55 + fade * 0.4;
            cAttr.setXYZ(i, r * fade, g * fade, b2 * fade);
            gcAttr.setXYZ(i, r * fade * 0.5, g * fade * 0.5, b2 * fade * 0.5);
          }
          cAttr.needsUpdate = true;
          gcAttr.needsUpdate = true;
        }
      }

      // Node flash-on-receipt decay
      nodeFlashes.forEach(nf => {
        if (nf.t > 0) {
          nf.t = Math.max(0, nf.t - dt * 2.5);
          nf.core.opacity = nf.baseCoreOp + nf.t * 0.15;
          nf.glow.opacity = nf.baseGlowOp + nf.t * 0.25;
          const base = new THREE.Color(nf.baseColor);
          const wh = new THREE.Color(0xffffff);
          nf.core.color.copy(base).lerp(wh, nf.t * 0.7);
        }
      });

      renderer.render(scene, cam);
    };
    animate();

    const onResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    onResize();

    return () => {
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      clearTimeout(state.resumeTimer);
      cancelAnimationFrame(state.animationId);
      renderer.dispose();
      sceneRef.current = null;
    };
  }, [nodes, edges, viewMode]);

  // ---- Hover — pauses orbit + group spin ----
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const s = sceneRef.current;
    if (!s || !canvasRef.current || s.isDragging) return;
    setHoverPos({ x: e.clientX + 16, y: e.clientY - 10 });
    const rect = canvasRef.current.getBoundingClientRect();
    s.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    s.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    s.raycaster.setFromCamera(s.mouse, s.camera);
    const meshes = Array.from(s.nodeMeshes.values()).map(n => n.mesh);
    const hits = s.raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      const found = Array.from(s.nodeMeshes.values()).find(
        n => n.mesh === hits[0].object,
      );
      if (found) {
        setHoveredNode(found.data);
        setHoveredEdge(null);
        s.isPaused = true;
        return;
      }
    }

    // Check edge hover (for channel lines)
    if (s.edgeLines.length > 0) {
      const edgeHitThreshold = 0.15;
      let closestEdge: EdgeData | null = null;
      let closestDist = edgeHitThreshold;
      for (const { line, data } of s.edgeLines) {
        const posAttr = line.geometry.attributes.position as THREE.BufferAttribute;
        const start = new THREE.Vector3().fromBufferAttribute(posAttr, 0);
        const end = new THREE.Vector3().fromBufferAttribute(posAttr, 1);
        const ray = s.raycaster.ray;
        const lineDir = end.clone().sub(start);
        const lineLen = lineDir.length();
        lineDir.normalize();
        const w0 = ray.origin.clone().sub(start);
        const a2 = ray.direction.dot(ray.direction);
        const b2 = ray.direction.dot(lineDir);
        const c2 = lineDir.dot(lineDir);
        const d2 = ray.direction.dot(w0);
        const e2 = lineDir.dot(w0);
        const denom = a2 * c2 - b2 * b2;
        if (Math.abs(denom) > 0.0001) {
          const sc = (b2 * e2 - c2 * d2) / denom;
          const tc = Math.max(0, Math.min(lineLen, (a2 * e2 - b2 * d2) / denom));
          if (sc > 0) {
            const ptRay = ray.origin.clone().add(ray.direction.clone().multiplyScalar(sc));
            const ptLine = start.clone().add(lineDir.clone().multiplyScalar(tc));
            const dist = ptRay.distanceTo(ptLine);
            if (dist < closestDist) {
              closestDist = dist;
              closestEdge = data;
            }
          }
        }
      }
      if (closestEdge) {
        setHoveredEdge(closestEdge);
        setHoveredNode(null);
        s.isPaused = true;
        return;
      }
    }

    setHoveredNode(null);
    setHoveredEdge(null);
    if (!s.userControlled) s.isPaused = false;
  }, []);

  // ---- Click ----
  const handleClick = useCallback((e: React.MouseEvent) => {
    const s = sceneRef.current;
    if (!s || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    s.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    s.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    s.raycaster.setFromCamera(s.mouse, s.camera);
    const meshes = Array.from(s.nodeMeshes.values()).map(n => n.mesh);
    const hits = s.raycaster.intersectObjects(meshes, false);
    if (hits.length > 0) {
      const found = Array.from(s.nodeMeshes.values()).find(
        n => n.mesh === hits[0].object,
      );
      if (found) {
        setSelectedNode(found.data);
        setCopiedPubkey(false);
        return;
      }
    }
  }, []);

  const handleCopyPubkey = useCallback(async (pk: string) => {
    try {
      await navigator.clipboard.writeText(pk);
    } catch {
      const el = document.createElement('textarea');
      el.value = pk;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedPubkey(true);
    setTimeout(() => setCopiedPubkey(false), 2000);
  }, []);

  const handleOpenChannel = useCallback((node: NodeData) => {
    setOpenChannelTarget({
      pubkey: node.id,
      alias: node.alias,
    });
    setShowOpenChannel(true);
    setSelectedNode(null);
  }, []);

  const handleMempool = useCallback((pk: string) => {
    window.open(`https://mempool.space/lightning/node/${pk}`, '_blank');
  }, []);

  const showHover = (!!hoveredNode || !!hoveredEdge) && !selectedNode;
  const selfPk = nodeStore.pubkey || '';
  const isSelf = selectedNode?.id === selfPk;

  const s1Label = viewMode === 'network' ? 'Nodes' : 'Channels';
  const s1Value = viewMode === 'network' ? nodes.length : activeCh;
  const s2Label = viewMode === 'network' ? 'Channels' : 'Capacity';
  const s2Value = viewMode === 'network' ? edges.length : formatSats(totalCap);

  const netInfo = networkGraphStore.networkInfo;
  const netLabel =
    viewMode === 'network' && netInfo
      ? `${netInfo.numNodes.toLocaleString()} nodes · ${netInfo.numChannels.toLocaleString()} channels on the Lightning Network`
      : '';

  const mData = networkGraphStore.mempoolData;
  const rankedNodes = useMemo(() => {
    const all = Array.from(mData.values());
    all.sort((a, b) => b.capacity - a.capacity);
    return all;
  }, [mData]);

  const filteredRankedNodes = useMemo(() => {
    if (!nodeSearch.trim()) return rankedNodes;
    const q = nodeSearch.toLowerCase();
    return rankedNodes.filter(n => n.alias.toLowerCase().includes(q));
  }, [rankedNodes, nodeSearch]);

  return (
    <S.Wrapper onMouseMove={handleMouseMove} onClick={handleClick}>
      <S.Canvas
        ref={canvasRef}
        style={{
          cursor: hoveredNode ? 'pointer' : 'grab',
        }}
      />

      {viewMode === 'network' && !nodeListOpen && (
        <S.NodeListToggle
          onClick={e => {
            e.stopPropagation();
            setNodeListOpen(true);
          }}
        >
          <List size={14} /> Top Nodes
        </S.NodeListToggle>
      )}

      <S.NodeListPanel
        open={nodeListOpen && viewMode === 'network'}
        onClick={e => e.stopPropagation()}
      >
        <S.NodeListHeader>
          <S.NodeListTitle>Top Nodes ({rankedNodes.length})</S.NodeListTitle>
          <S.NodeListClose onClick={() => setNodeListOpen(false)}>
            <X size={14} />
          </S.NodeListClose>
        </S.NodeListHeader>
        <S.NodeSearchBox>
          <Search
            size={13}
            strokeWidth={1.5}
            style={{ color: 'rgba(255,255,255,0.3)' }}
          />
          <S.NodeSearchInput
            placeholder="Search nodes..."
            value={nodeSearch}
            onChange={e => setNodeSearch(e.target.value)}
          />
        </S.NodeSearchBox>
        <S.NodeListScroll>
          {filteredRankedNodes.map((n, i) => (
            <S.NodeRow
              key={n.publicKey}
              onClick={() => {
                const nd = nodes.find(nd2 => nd2.id === n.publicKey);
                if (nd) {
                  setSelectedNode(nd);
                  setCopiedPubkey(false);
                }
              }}
            >
              <S.NodeRowRank>{i + 1}</S.NodeRowRank>
              <S.NodeRowDot c={n.color || '#8b5cf6'} />
              <S.NodeRowInfo>
                <S.NodeRowAlias>{n.alias || 'Unknown'}</S.NodeRowAlias>
                <S.NodeRowMeta>
                  {formatSats(n.capacity)} · {n.channels.toLocaleString()} ch
                </S.NodeRowMeta>
              </S.NodeRowInfo>
            </S.NodeRow>
          ))}
        </S.NodeListScroll>
      </S.NodeListPanel>

      {netLabel && <S.NetworkLabel>{netLabel}</S.NetworkLabel>}

      {viewMode === 'network' && networkGraphStore.loading && (
        <S.LoadingOverlay>
          <S.Spinner>
            <Loader2 size={20} strokeWidth={1.5} />
          </S.Spinner>
          Loading Lightning Network...
        </S.LoadingOverlay>
      )}

      <S.HoverCard visible={showHover} style={{ left: hoverPos.x, top: hoverPos.y }}>
        {hoveredNode && !hoveredNode.isCenter && (
          <>
            <S.HoverTitle>{hoveredNode.alias}</S.HoverTitle>
            <S.HoverRow>
              <span>Capacity</span>
              <span>{formatSats(hoveredNode.capacity)}</span>
            </S.HoverRow>
            <S.HoverRow>
              <span>Channels</span>
              <span>{hoveredNode.channelCount}</span>
            </S.HoverRow>
            <S.HoverHint>Click to view details</S.HoverHint>
          </>
        )}
        {hoveredNode && hoveredNode.isCenter && (
          <>
            <S.HoverTitle>{hoveredNode.alias}</S.HoverTitle>
            <S.HoverRow>
              <span>Channels</span>
              <span>{hoveredNode.channelCount}</span>
            </S.HoverRow>
            <S.HoverDivider />
            <S.HoverRow>
              <span>Total Capacity</span>
              <span>{formatSats(totalCap)}</span>
            </S.HoverRow>
            {viewMode === 'mynode' && (
              <>
                <S.HoverRow>
                  <span>Inbound</span>
                  <span>{formatSats(totalIn)}</span>
                </S.HoverRow>
                <S.HoverRow>
                  <span>Outbound</span>
                  <span>{formatSats(totalOut)}</span>
                </S.HoverRow>
              </>
            )}
            <S.HoverHint>Click to view details</S.HoverHint>
          </>
        )}
        {hoveredEdge && (
          <>
            <S.HoverTitle>Channel to {hoveredEdge.to.alias}</S.HoverTitle>
            <S.HoverRow>
              <span>Capacity</span>
              <span>{formatSats(hoveredEdge.capacity)}</span>
            </S.HoverRow>
            {viewMode === 'mynode' && (
              <>
                <S.HoverRow>
                  <span>Local</span>
                  <span>{formatSats(hoveredEdge.localBalance)}</span>
                </S.HoverRow>
                <S.HoverRow>
                  <span>Remote</span>
                  <span>{formatSats(hoveredEdge.remoteBalance)}</span>
                </S.HoverRow>
              </>
            )}
          </>
        )}
      </S.HoverCard>

      <S.DetailPanel visible={!!selectedNode} onClick={e => e.stopPropagation()}>
        {selectedNode && (
          <>
            <S.DetailClose onClick={() => setSelectedNode(null)}>
              <X size={16} />
            </S.DetailClose>
            <S.DetailAlias>
              <S.DetailColorDot nodeColor={selectedNode.color} />
              {selectedNode.alias}
            </S.DetailAlias>
            <S.DetailPubkey>
              {selectedNode.id}
              <S.CopyBtn
                onClick={() => handleCopyPubkey(selectedNode.id)}
                title="Copy Node ID"
              >
                {copiedPubkey ? (
                  <Check size={12} strokeWidth={2} />
                ) : (
                  <Copy size={12} strokeWidth={1.5} />
                )}
              </S.CopyBtn>
            </S.DetailPubkey>
            <S.DetailRow>
              <S.DetailLabel>Capacity</S.DetailLabel>
              <S.DetailValue>{formatSats(selectedNode.capacity)}</S.DetailValue>
            </S.DetailRow>
            <S.DetailRow>
              <S.DetailLabel>Channels</S.DetailLabel>
              <S.DetailValue>{selectedNode.channelCount}</S.DetailValue>
            </S.DetailRow>
            <S.DetailDivider />
            <S.DetailActions>
              {!isSelf && (
                <S.DetailActionBtn
                  primary
                  onClick={() => handleOpenChannel(selectedNode)}
                >
                  <Link2 size={14} />
                  Open Channel
                </S.DetailActionBtn>
              )}
              <S.DetailActionBtn onClick={() => handleCopyPubkey(selectedNode.id)}>
                {copiedPubkey ? <Check size={14} /> : <Copy size={14} />}
                {copiedPubkey ? 'Copied!' : 'Copy Node ID'}
              </S.DetailActionBtn>
              <S.DetailActionBtn onClick={() => handleMempool(selectedNode.id)}>
                <ExternalLink size={14} />
                View on Mempool
              </S.DetailActionBtn>
            </S.DetailActions>
          </>
        )}
      </S.DetailPanel>

      <S.Overlay>
        <S.Stats>
          <S.StatCard>
            <S.StatLabel>{s1Label}</S.StatLabel>
            <S.StatValue>{s1Value}</S.StatValue>
          </S.StatCard>
          <S.StatCard>
            <S.StatLabel>{s2Label}</S.StatLabel>
            <S.StatValue>{s2Value}</S.StatValue>
          </S.StatCard>
          {viewMode === 'mynode' && (
            <>
              <S.StatCard>
                <S.StatLabel>Inbound</S.StatLabel>
                <S.StatValue>{formatSats(totalIn)}</S.StatValue>
              </S.StatCard>
              <S.StatCard>
                <S.StatLabel>Outbound</S.StatLabel>
                <S.StatValue>{formatSats(totalOut)}</S.StatValue>
              </S.StatCard>
            </>
          )}
          {viewMode === 'network' && netInfo && (
            <S.StatCard>
              <S.StatLabel>Total Capacity</S.StatLabel>
              <S.StatValue>
                {formatSats(parseInt(netInfo.totalNetworkCapacity, 10) || 0)}
              </S.StatValue>
            </S.StatCard>
          )}
        </S.Stats>
        <S.CTASection>
          {viewMode === 'mynode' && (
            <>
              <S.CTAButton onClick={() => setShowReceive(true)}>
                <ArrowDownLeft size={14} />
                Receive
              </S.CTAButton>
              <S.CTAButton onClick={() => setShowSend(true)}>
                <ArrowUpRight size={14} />
                Send
              </S.CTAButton>
            </>
          )}
          <S.CTAButton
            variant="primary"
            onClick={() => {
              setOpenChannelTarget(null);
              setShowOpenChannel(true);
            }}
          >
            <Link2 size={14} />
            Open Channel
          </S.CTAButton>
        </S.CTASection>
      </S.Overlay>

      {showReceive && (
        <TransactionModal direction="receive" onClose={() => setShowReceive(false)} />
      )}
      {showSend && (
        <TransactionModal direction="send" onClose={() => setShowSend(false)} />
      )}
      {showOpenChannel && (
        <OpenChannelModal
          onClose={() => {
            setShowOpenChannel(false);
            setOpenChannelTarget(null);
          }}
          initialPubkey={openChannelTarget?.pubkey}
          initialAlias={openChannelTarget?.alias}
        />
      )}
    </S.Wrapper>
  );
});

export default GraphVisualization;
