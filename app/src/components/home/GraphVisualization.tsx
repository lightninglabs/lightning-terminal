import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error - three.js types require newer TS
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { ChannelStatus } from 'types/state';
import { useStore } from 'store';
import TransactionModal from 'components/common/TransactionModal';
import OpenChannelModal from 'components/common/OpenChannelModal';

interface NodeData {
  id: string;
  alias: string;
  x: number;
  y: number;
  z: number;
  isCenter: boolean;
  capacity: number;
}

interface ChannelEdge {
  from: NodeData;
  to: NodeData;
  capacity: number;
  active: boolean;
  localBalance: number;
  remoteBalance: number;
}

const Styled = {
  Wrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    background: radial-gradient(ellipse at 50% 50%, #0f1218 0%, #090b10 100%);
  `,
  Canvas: styled.canvas`
    display: block;
    width: 100%;
    height: 100%;
  `,
  HoverCard: styled.div<{ visible: boolean }>`
    position: fixed;
    pointer-events: none;
    background: rgba(10, 12, 18, 0.88);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 10px;
    padding: 12px 16px;
    min-width: 200px;
    opacity: ${props => (props.visible ? 1 : 0)};
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
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 3px;

    span:last-child {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
  `,
  StatusDot: styled.span<{ active?: boolean }>`
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => (props.active ? '#a78bfa' : '#6b7280')};
    margin-right: 6px;
    vertical-align: middle;
  `,
  HoverDivider: styled.div`
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
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
    gap: 24px;
    pointer-events: auto;
  `,
  StatCard: styled.div`
    background: rgba(13, 16, 23, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 10px 14px;
    min-width: 120px;
  `,
  StatLabel: styled.div`
    font-size: 10px;
    color: rgba(255, 255, 255, 0.35);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 3px;
  `,
  StatValue: styled.div`
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
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

    ${props =>
      props.variant === 'primary'
        ? `
      background: rgba(139, 92, 246, 0.85);
      color: white;
      &:hover { background: rgba(139, 92, 246, 1); }
    `
        : `
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.9);
      }
    `}
  `,
};

const formatSats = (sats: number) => {
  if (sats >= 100000000) return `${(sats / 100000000).toFixed(2)} BTC`;
  if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M sats`;
  if (sats >= 1000) return `${(sats / 1000).toFixed(0)}K sats`;
  return `${sats} sats`;
};

const GraphVisualization: React.FC = () => {
  const { channelStore, nodeStore } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    group: THREE.Group;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    nodeMeshes: Map<string, { mesh: THREE.Mesh; data: NodeData }>;
    edgeLines: Array<{ line: THREE.Line; data: ChannelEdge }>;
    animationId: number;
    isPaused: boolean;
    isDragging: boolean;
    userControlled: boolean;
    dragStart: { x: number; y: number };
    resumeTimer: ReturnType<typeof setTimeout>;
  } | null>(null);

  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<ChannelEdge | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [showReceive, setShowReceive] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showOpenChannel, setShowOpenChannel] = useState(false);

  const { nodes, edges } = useMemo(() => {
    const channels = channelStore.sortedChannels;
    const centerNode: NodeData = {
      id: 'self',
      alias: nodeStore.alias || 'My Node',
      x: 0,
      y: 0,
      z: 0,
      isCenter: true,
      capacity: 0,
    };

    const peerNodes: NodeData[] = [];
    const channelEdges: ChannelEdge[] = [];
    const seenPeers = new Set<string>();

    channels.forEach((ch, i) => {
      const peerId = ch.remotePubkey;
      if (seenPeers.has(peerId)) return;
      seenPeers.add(peerId);

      const angle = (i / Math.max(channels.length, 1)) * Math.PI * 2;
      const radius = 2 + Math.random() * 2;
      const yOffset = (Math.random() - 0.5) * 2;

      const peerNode: NodeData = {
        id: peerId,
        alias: ch.aliasLabel || peerId.substring(0, 12) + '...',
        x: Math.cos(angle) * radius,
        y: yOffset,
        z: Math.sin(angle) * radius,
        isCenter: false,
        capacity: ch.capacity.toNumber(),
      };

      peerNodes.push(peerNode);
      channelEdges.push({
        from: centerNode,
        to: peerNode,
        capacity: ch.capacity.toNumber(),
        active: ch.status === ChannelStatus.OPEN,
        localBalance: ch.localBalance.toNumber(),
        remoteBalance: ch.remoteBalance.toNumber(),
      });
    });

    return { nodes: [centerNode, ...peerNodes], edges: channelEdges };
  }, [channelStore.sortedChannels, nodeStore.alias]);

  const totalCapacity = edges.reduce((sum, e) => sum + e.capacity, 0);
  const totalInbound = edges.reduce((sum, e) => sum + e.remoteBalance, 0);
  const totalOutbound = edges.reduce((sum, e) => sum + e.localBalance, 0);
  const activeChannels = edges.filter(e => e.active).length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      200,
    );
    camera.position.set(0, 1.5, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const group = new THREE.Group();
    scene.add(group);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xc4b5fd, 0.3);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const nodeMeshes = new Map<string, { mesh: THREE.Mesh; data: NodeData }>();
    const edgeLines: Array<{ line: THREE.Line; data: ChannelEdge }> = [];

    edges.forEach(edge => {
      const pts = [
        new THREE.Vector3(edge.from.x, edge.from.y, edge.from.z),
        new THREE.Vector3(edge.to.x, edge.to.y, edge.to.z),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const material = new THREE.LineBasicMaterial({
        color: edge.active ? 0xa78bfa : 0x374151,
        transparent: true,
        opacity: edge.active ? 0.18 : 0.07,
      });
      const line = new THREE.Line(geo, material);
      group.add(line);
      edgeLines.push({ line, data: edge });
    });

    const createRoundedCube = (
      size: number,
      faceColor: number,
      faceOpacity: number,
      edgeColor: number,
      edgeOpacity: number,
      emissiveColor: number,
      emissiveIntensity: number,
    ) => {
      const cubeGroup = new THREE.Group();
      const segments = 4;
      const boxGeo = new THREE.BoxGeometry(
        size,
        size,
        size,
        segments,
        segments,
        segments,
      );
      const positions = boxGeo.attributes.position;
      const v = new THREE.Vector3();
      const bevel = size * 0.15;
      for (let i = 0; i < positions.count; i++) {
        v.fromBufferAttribute(positions, i);
        const half = size / 2;
        const signX = Math.sign(v.x) || 1;
        const signY = Math.sign(v.y) || 1;
        const signZ = Math.sign(v.z) || 1;
        const ax = Math.abs(v.x);
        const ay = Math.abs(v.y);
        const az = Math.abs(v.z);
        if (ax > half - bevel && ay > half - bevel) {
          const cx = half - bevel;
          const cy = half - bevel;
          const dx = ax - cx;
          const dy = ay - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            v.x = signX * (cx + (dx / dist) * bevel);
            v.y = signY * (cy + (dy / dist) * bevel);
          }
        }
        if (ax > half - bevel && az > half - bevel) {
          const cx = half - bevel;
          const cz = half - bevel;
          const dx = ax - cx;
          const dz = az - cz;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > 0) {
            v.x = signX * (cx + (dx / dist) * bevel);
            v.z = signZ * (cz + (dz / dist) * bevel);
          }
        }
        if (ay > half - bevel && az > half - bevel) {
          const cy = half - bevel;
          const cz = half - bevel;
          const dy = ay - cy;
          const dz = az - cz;
          const dist = Math.sqrt(dy * dy + dz * dz);
          if (dist > 0) {
            v.y = signY * (cy + (dy / dist) * bevel);
            v.z = signZ * (cz + (dz / dist) * bevel);
          }
        }
        positions.setXYZ(i, v.x, v.y, v.z);
      }
      boxGeo.computeVertexNormals();

      const faceMat = new THREE.MeshStandardMaterial({
        color: faceColor,
        emissive: emissiveColor,
        emissiveIntensity,
        metalness: 0.4,
        roughness: 0.5,
        transparent: true,
        opacity: faceOpacity,
      });
      cubeGroup.add(new THREE.Mesh(boxGeo, faceMat));

      const edgesGeo = new THREE.EdgesGeometry(boxGeo, 20);
      const edgeMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: edgeOpacity,
      });
      cubeGroup.add(new THREE.LineSegments(edgesGeo, edgeMat));

      return cubeGroup;
    };

    nodes.forEach(node => {
      const cubeSize = node.isCenter
        ? 0.45
        : 0.1 + Math.min(node.capacity / 100000000, 0.12);

      let cubeGroup: THREE.Group;
      if (node.isCenter) {
        cubeGroup = createRoundedCube(
          cubeSize,
          0x1a1030,
          0.85,
          0xa78bfa,
          0.7,
          0x7c3aed,
          0.6,
        );
        const glowGeo = new THREE.SphereGeometry(cubeSize * 1.2, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0x7c3aed,
          transparent: true,
          opacity: 0.05,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        cubeGroup.add(glow);
      } else {
        cubeGroup = createRoundedCube(
          cubeSize,
          0x14101f,
          0.75,
          0x8b5cf6,
          0.45,
          0x6d28d9,
          0.15,
        );
      }

      cubeGroup.position.set(node.x, node.y, node.z);
      group.add(cubeGroup);

      const hitGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(node.x, node.y, node.z);
      group.add(hitMesh);
      nodeMeshes.set(node.id, { mesh: hitMesh, data: node });
    });

    const dustCount = 400;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 20;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x6d28d9,
      size: 0.01,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true,
    });
    group.add(new THREE.Points(dustGeo, dustMat));

    const raycaster = new THREE.Raycaster();
    raycaster.params = { ...raycaster.params, Points: { threshold: 0.3 } };
    const mouse = new THREE.Vector2();

    const state = {
      scene,
      camera,
      renderer,
      group,
      raycaster,
      mouse,
      nodeMeshes,
      edgeLines,
      animationId: 0,
      isPaused: false,
      isDragging: false,
      userControlled: false,
      dragStart: { x: 0, y: 0 },
      resumeTimer: (0 as unknown) as ReturnType<typeof setTimeout>,
    };
    sceneRef.current = state;

    const onMouseDown = (e: MouseEvent) => {
      state.isDragging = true;
      state.dragStart = { x: e.clientX, y: e.clientY };
      state.userControlled = true;
      state.isPaused = true;
      clearTimeout(state.resumeTimer);
    };

    const onMouseMoveDrag = (e: MouseEvent) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.dragStart.x;
      const dy = e.clientY - state.dragStart.y;
      group.rotation.y += dx * 0.005;
      group.rotation.x += dy * 0.005;
      state.dragStart = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      state.resumeTimer = setTimeout(() => {
        state.userControlled = false;
        state.isPaused = false;
      }, 3000);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMoveDrag);
    window.addEventListener('mouseup', onMouseUp);

    const clock = new THREE.Clock();
    const animate = () => {
      state.animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!state.isPaused && !state.userControlled) {
        group.rotation.y += 0.0006;
      }

      edgeLines.forEach(({ line, data }) => {
        if (data.active) {
          const mat = line.material as THREE.LineBasicMaterial;
          mat.opacity = 0.12 + Math.sin(elapsed * 2 + data.capacity * 0.00001) * 0.08;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMoveDrag);
      window.removeEventListener('mouseup', onMouseUp);
      clearTimeout(state.resumeTimer);
      cancelAnimationFrame(state.animationId);
      renderer.dispose();
      sceneRef.current = null;
    };
  }, [nodes, edges]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const state = sceneRef.current;
    if (!state || !canvasRef.current || state.isDragging) return;

    setHoverPos({ x: e.clientX + 16, y: e.clientY - 10 });

    const rect = canvasRef.current.getBoundingClientRect();
    state.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    state.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    state.raycaster.setFromCamera(state.mouse, state.camera);

    const meshes = Array.from(state.nodeMeshes.values()).map(n => n.mesh);
    const intersects = state.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const found = Array.from(state.nodeMeshes.values()).find(n => n.mesh === hit);
      if (found) {
        setHoveredNode(found.data);
        setHoveredEdge(null);
        state.isPaused = true;
        return;
      }
    }

    setHoveredNode(null);
    setHoveredEdge(null);
    if (!state.userControlled) {
      state.isPaused = false;
    }
  }, []);

  const showHover = !!hoveredNode || !!hoveredEdge;

  return (
    <Styled.Wrapper onMouseMove={handleMouseMove}>
      <Styled.Canvas ref={canvasRef} style={{ cursor: 'grab' }} />

      <Styled.HoverCard visible={showHover} style={{ left: hoverPos.x, top: hoverPos.y }}>
        {hoveredNode && !hoveredNode.isCenter && (
          <>
            <Styled.HoverTitle>{hoveredNode.alias}</Styled.HoverTitle>
            <Styled.HoverRow>
              <span>Capacity</span>
              <span>{formatSats(hoveredNode.capacity)}</span>
            </Styled.HoverRow>
          </>
        )}
        {hoveredNode && hoveredNode.isCenter && (
          <>
            <Styled.HoverTitle>{hoveredNode.alias}</Styled.HoverTitle>
            <Styled.HoverRow>
              <span>Channels</span>
              <span>{activeChannels}</span>
            </Styled.HoverRow>
            <Styled.HoverDivider />
            <Styled.HoverRow>
              <span>Total Capacity</span>
              <span>{formatSats(totalCapacity)}</span>
            </Styled.HoverRow>
            <Styled.HoverRow>
              <span>Inbound Liquidity</span>
              <span>{formatSats(totalInbound)}</span>
            </Styled.HoverRow>
            <Styled.HoverRow>
              <span>Outbound Liquidity</span>
              <span>{formatSats(totalOutbound)}</span>
            </Styled.HoverRow>
          </>
        )}
        {hoveredEdge && (
          <>
            <Styled.HoverTitle>
              <Styled.StatusDot active={hoveredEdge.active} />
              Channel to {hoveredEdge.to.alias}
            </Styled.HoverTitle>
            <Styled.HoverRow>
              <span>Capacity</span>
              <span>{formatSats(hoveredEdge.capacity)}</span>
            </Styled.HoverRow>
            <Styled.HoverRow>
              <span>Local</span>
              <span>{formatSats(hoveredEdge.localBalance)}</span>
            </Styled.HoverRow>
            <Styled.HoverRow>
              <span>Remote</span>
              <span>{formatSats(hoveredEdge.remoteBalance)}</span>
            </Styled.HoverRow>
          </>
        )}
      </Styled.HoverCard>

      <Styled.Overlay>
        <Styled.Stats>
          <Styled.StatCard>
            <Styled.StatLabel>Channels</Styled.StatLabel>
            <Styled.StatValue>{activeChannels}</Styled.StatValue>
          </Styled.StatCard>
          <Styled.StatCard>
            <Styled.StatLabel>Capacity</Styled.StatLabel>
            <Styled.StatValue>{formatSats(totalCapacity)}</Styled.StatValue>
          </Styled.StatCard>
          <Styled.StatCard>
            <Styled.StatLabel>Inbound</Styled.StatLabel>
            <Styled.StatValue>{formatSats(totalInbound)}</Styled.StatValue>
          </Styled.StatCard>
          <Styled.StatCard>
            <Styled.StatLabel>Outbound</Styled.StatLabel>
            <Styled.StatValue>{formatSats(totalOutbound)}</Styled.StatValue>
          </Styled.StatCard>
        </Styled.Stats>
        <Styled.CTASection>
          <Styled.CTAButton onClick={() => setShowReceive(true)}>
            <ArrowDownLeft size={14} />
            Receive
          </Styled.CTAButton>
          <Styled.CTAButton onClick={() => setShowSend(true)}>
            <ArrowUpRight size={14} />
            Send
          </Styled.CTAButton>
          <Styled.CTAButton onClick={() => setShowOpenChannel(true)}>
            Open Channel
          </Styled.CTAButton>
        </Styled.CTASection>
      </Styled.Overlay>

      {showReceive && (
        <TransactionModal direction="receive" onClose={() => setShowReceive(false)} />
      )}
      {showSend && (
        <TransactionModal direction="send" onClose={() => setShowSend(false)} />
      )}
      {showOpenChannel && <OpenChannelModal onClose={() => setShowOpenChannel(false)} />}
    </Styled.Wrapper>
  );
};

export default observer(GraphVisualization);
