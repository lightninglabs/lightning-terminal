import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error - three.js types require newer TS
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useStore } from 'store';
import {
  ArrowLeft,
  Link2,
  Server,
  Loader2,
  Copy,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

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

const S = {
  Wrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #030508;
  `,
  Canvas: styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  `,
  TopBar: styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(to bottom, rgba(3, 5, 8, 0.9) 0%, transparent 100%);
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  `,
  BackBtn: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 8px;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: color 0.15s ease;

    &:hover {
      color: #ffffff;
    }
  `,
  Title: styled.div`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(255, 255, 255, 0.35);
  `,
  Stats: styled.div`
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #6b7280;
  `,
  StatVal: styled.span`
    color: #e5e7eb;
    font-weight: 500;
    margin-left: 4px;
  `,
  Banner: styled.div`
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 20px;
    background: rgba(19, 22, 32, 0.92);
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: 12px;
    backdrop-filter: blur(12px);
    max-width: 540px;
    width: calc(100% - 40px);
  `,
  BannerText: styled.div`
    flex: 1;
    font-size: 13px;
    color: #9ca3af;
    line-height: 1.4;

    strong {
      color: #e5e7eb;
    }
  `,
  BannerBtn: styled.button<{ variant?: 'primary' | 'secondary' }>`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    border: none;

    ${p =>
      p.variant === 'primary'
        ? `
      background: #6366f1;
      color: white;
      &:hover { background: #5355d4; }
    `
        : `
      background: rgba(255, 255, 255, 0.06);
      color: #e5e7eb;
      border: 1px solid rgba(255, 255, 255, 0.1);
      &:hover { background: rgba(255, 255, 255, 0.1); }
    `}
  `,
  BannerClose: styled.button`
    background: none;
    border: none;
    color: #4b5563;
    cursor: pointer;
    padding: 4px;
    display: flex;

    &:hover {
      color: #9ca3af;
    }
  `,
  Loading: styled.div`
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #030508;
    color: #6b7280;
    font-size: 14px;
  `,
  Tooltip: styled.div`
    position: absolute;
    z-index: 4;
    background: rgba(19, 22, 32, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    padding: 12px 14px;
    pointer-events: none;
    min-width: 200px;
    max-width: 260px;
    backdrop-filter: blur(8px);
  `,
  TtAlias: styled.div`
    font-size: 13px;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 6px;
  `,
  TtRow: styled.div`
    font-size: 11px;
    color: #6b7280;
    margin-bottom: 3px;

    span {
      color: #9ca3af;
      float: right;
    }
  `,
  DetailPanel: styled.div`
    position: absolute;
    top: 60px;
    right: 16px;
    z-index: 3;
    width: 280px;
    background: rgba(19, 22, 32, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 18px;
    backdrop-filter: blur(12px);
  `,
  DpClose: styled.button`
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;

    &:hover {
      color: #e5e7eb;
    }
  `,
  DpAlias: styled.div`
    font-size: 15px;
    font-weight: 600;
    color: #e5e7eb;
    margin-bottom: 4px;
    padding-right: 24px;
  `,
  DpPubkey: styled.div`
    font-size: 11px;
    color: #6b7280;
    font-family: 'SF Mono', 'Fira Code', monospace;
    word-break: break-all;
    margin-bottom: 14px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  `,
  DpCopyBtn: styled.button`
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 2px;
    flex-shrink: 0;

    &:hover {
      color: #e5e7eb;
    }
  `,
  DpStats: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 14px;
  `,
  DpStat: styled.div`
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 8px 10px;
  `,
  DpStatLabel: styled.div`
    font-size: 10px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 2px;
  `,
  DpStatVal: styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #e5e7eb;
  `,
  DpActions: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  DpActionBtn: styled.button<{ variant?: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;

    ${p =>
      p.variant === 'primary'
        ? `
      background: #6366f1;
      color: white;
      border: none;
      &:hover { background: #5355d4; }
    `
        : `
      background: rgba(255, 255, 255, 0.04);
      color: #e5e7eb;
      border: 1px solid rgba(255, 255, 255, 0.1);
      &:hover { background: rgba(255, 255, 255, 0.08); }
    `}
  `,
};

const formatSats = (sats: number): string => {
  if (sats >= 100_000_000) {
    const btc = sats / 100_000_000;
    return Math.round(btc).toLocaleString() + ' BTC';
  }
  if (sats >= 1_000_000) {
    const m = sats / 1_000_000;
    return Math.round(m).toLocaleString() + 'M sats';
  }
  return sats.toLocaleString() + ' sats';
};

const ExploreNetworkPage: React.FC = () => {
  const { networkGraphStore, appView } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);
  const hoveredRef = useRef<NodeData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [copiedPk, setCopiedPk] = useState(false);

  useEffect(() => {
    networkGraphStore.fetchGraph();
  }, [networkGraphStore]);

  const nodes: NodeData[] = useMemo(() => {
    if (networkGraphStore.nodes.length === 0) return [];
    const mData = networkGraphStore.mempoolData;
    const count = networkGraphStore.nodes.length;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    return networkGraphStore.nodes.map((n, i) => {
      const md = mData.get(n.pubKey);
      const t = goldenAngle * i;
      const yNorm = 1 - (2 * i) / (count - 1 || 1);
      const radY = Math.sqrt(1 - yNorm * yNorm);
      const spread = 7 + (i % 5) * 0.4;

      return {
        id: n.pubKey,
        alias: n.alias || n.pubKey.substring(0, 12) + '...',
        x: Math.cos(t) * radY * spread,
        y: yNorm * spread * 0.6,
        z: Math.sin(t) * radY * spread,
        isCenter: false,
        capacity: md?.capacity || 0,
        color: n.color || '#8b5cf6',
        channelCount: md?.channels || 0,
      };
    });
  }, [networkGraphStore.nodes, networkGraphStore.mempoolData]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (!sceneRef.current) return;
    const { camera, raycaster, mouse, nodeMeshes } = sceneRef.current;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const meshes = Array.from(nodeMeshes.values()).map((v: any) => v.mesh);
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length > 0) {
      for (const [, v] of nodeMeshes) {
        if ((v as any).mesh === hits[0].object) {
          const nd = (v as any).data;
          hoveredRef.current = nd;
          setHoveredNode(nd);
          return;
        }
      }
    }
    hoveredRef.current = null;
    setHoveredNode(null);
  }, []);

  const handleClick = useCallback(() => {
    if (hoveredNode) {
      setSelectedNode(selectedNode?.id === hoveredNode.id ? null : hoveredNode);
    }
  }, [hoveredNode, selectedNode]);

  const handleCopyPk = useCallback((pk: string) => {
    navigator.clipboard.writeText(pk);
    setCopiedPk(true);
    setTimeout(() => setCopiedPk(false), 2000);
  }, []);

  // Three.js scene
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
    cam.position.set(0, 1, 18);
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

    // Background stars
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
    scene.add(
      new THREE.Points(
        bgGeo,
        new THREE.PointsMaterial({
          color: 0xc0c8e0,
          size: 0.12,
          transparent: true,
          opacity: 0.35,
          sizeAttenuation: true,
        }),
      ),
    );

    const hexToInt = (h: string) => parseInt(h.replace('#', ''), 16) || 0x8b5cf6;

    const caps = nodes.map(n => n.capacity).filter(c => c > 0);
    const logMin = caps.length > 0 ? Math.log(Math.min(...caps) + 1) : 0;
    const logMax = caps.length > 0 ? Math.log(Math.max(...caps) + 1) : 1;
    const logRange = logMax - logMin || 1;

    const nodeMeshes = new Map<string, { mesh: THREE.Mesh; data: NodeData }>();

    nodes.forEach(node => {
      const logCap = node.capacity > 0 ? Math.log(node.capacity + 1) : 0;
      const capNorm = (logCap - logMin) / logRange;
      const starR = 0.015 + capNorm * 0.07;
      const col = hexToInt(node.color);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(starR, 12, 12),
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.85,
        }),
      );
      core.position.set(node.x, node.y, node.z);
      group.add(core);

      const glowMul = 2.0 + capNorm * 1.5;
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(starR * glowMul, 12, 12),
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.02 + capNorm * 0.03,
        }),
      );
      glow.position.set(node.x, node.y, node.z);
      group.add(glow);

      const hitR = Math.max(starR * 2.5, 0.2);
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(hitR, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hit.position.set(node.x, node.y, node.z);
      group.add(hit);
      nodeMeshes.set(node.id, { mesh: hit, data: node });
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Lightning bolt pool
    const BOLT_COUNT = 4;
    const BOLT_SEGS = 48;
    const bolts: Array<{
      line: THREE.Line;
      glowPts: THREE.Points;
      fromPos: THREE.Vector3;
      toPos: THREE.Vector3;
      progress: number;
      speed: number;
      alive: boolean;
    }> = [];

    if (nodes.length > 1) {
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
          opacity: 0.3,
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
          size: 0.08,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.15,
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
        });
      }
    }

    const fireBolt = () => {
      const idle = bolts.find(b => !b.alive);
      if (!idle || nodes.length < 2) return;
      const a = Math.floor(Math.random() * nodes.length);
      let b = Math.floor(Math.random() * (nodes.length - 1));
      if (b >= a) b++;
      const from = nodes[a];
      const to = nodes[b];
      idle.fromPos.set(from.x, from.y, from.z);
      idle.toPos.set(to.x, to.y, to.z);

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
      for (let s = 0; s <= BOLT_SEGS; s++) {
        const t = s / BOLT_SEGS;
        const pt = idle.fromPos.clone().lerp(idle.toPos, t);
        if (s > 0 && s < BOLT_SEGS) {
          const j = jitter * (1 - Math.abs(t - 0.5) * 2) * 0.6;
          pt.addScaledVector(p1, (Math.random() - 0.5) * j);
          pt.addScaledVector(p2, (Math.random() - 0.5) * j);
        }
        lAttr.setXYZ(s, pt.x, pt.y, pt.z);
        gAttr.setXYZ(s, pt.x, pt.y, pt.z);
      }
      lAttr.needsUpdate = true;
      gAttr.needsUpdate = true;

      idle.progress = 0;
      idle.speed = 0.6 + Math.random() * 0.4;
      idle.alive = true;
      idle.line.visible = true;
      idle.glowPts.visible = true;
    };

    let boltTimer = 0;

    const state: any = {
      camera: cam,
      raycaster,
      mouse,
      nodeMeshes,
      animationId: 0,
      isPaused: false,
      isDragging: false,
      userControlled: false,
      dragStart: { x: 0, y: 0 },
      resumeTimer: 0 as any,
    };
    sceneRef.current = state;

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

    const animate = () => {
      state.animationId = requestAnimationFrame(animate);
      const hovered = hoveredRef.current;
      const shouldPause = state.isPaused || state.userControlled || hovered !== null;
      if (!shouldPause) {
        group.rotation.y += 0.00012;
      }

      // Update lightning bolts
      const dt = 0.016;
      boltTimer += dt;
      if (boltTimer > 2.5 + Math.random() * 3.5) {
        boltTimer = 0;
        fireBolt();
      }

      bolts.forEach(bolt => {
        if (!bolt.alive) return;
        bolt.progress += bolt.speed * dt;
        if (bolt.progress >= 1.3) {
          bolt.alive = false;
          bolt.line.visible = false;
          bolt.glowPts.visible = false;
          return;
        }
        const cAttr = bolt.line.geometry.attributes.color as THREE.BufferAttribute;
        const gcAttr = bolt.glowPts.geometry.attributes.color as THREE.BufferAttribute;
        for (let s = 0; s <= BOLT_SEGS; s++) {
          const t = s / BOLT_SEGS;
          const dist = Math.abs(t - bolt.progress);
          const headW = 0.35;
          const bright = Math.max(0, 1 - dist / headW);
          const fade = Math.pow(bright, 1.5);
          const r = 0.35 + fade * 0.2;
          const g = 0.15 + fade * 0.15;
          const b2 = 0.55 + fade * 0.4;
          cAttr.setXYZ(s, r * fade, g * fade, b2 * fade);
          gcAttr.setXYZ(s, r * fade * 0.5, g * fade * 0.5, b2 * fade * 0.5);
        }
        cAttr.needsUpdate = true;
        gcAttr.needsUpdate = true;
      });

      renderer.render(scene, cam);
    };
    animate();

    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(state.animationId);
      clearTimeout(state.resumeTimer);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [nodes]);

  const netInfo = networkGraphStore.networkInfo;

  return (
    <S.Wrapper>
      {networkGraphStore.loading && (
        <S.Loading>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          Loading network data...
        </S.Loading>
      )}

      <S.Canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{
          cursor: hoveredNode ? 'pointer' : 'grab',
        }}
      />

      <S.TopBar>
        <S.BackBtn onClick={() => appView.goTo('/')}>
          <ArrowLeft size={16} />
        </S.BackBtn>
        <S.Title>Explorer</S.Title>
        <S.Stats>
          {netInfo && (
            <>
              <span>
                Nodes
                <S.StatVal>{netInfo.numNodes.toLocaleString()}</S.StatVal>
              </span>
              <span>
                Channels
                <S.StatVal>{netInfo.numChannels.toLocaleString()}</S.StatVal>
              </span>
              <span>
                Capacity
                <S.StatVal>
                  {formatSats(parseInt(netInfo.totalNetworkCapacity, 10) || 0)}
                </S.StatVal>
              </span>
            </>
          )}
        </S.Stats>
      </S.TopBar>

      {hoveredNode && !selectedNode && (
        <S.Tooltip
          style={{
            left: mousePos.x + 14,
            top: mousePos.y + 14,
          }}
        >
          <S.TtAlias>{hoveredNode.alias}</S.TtAlias>
          <S.TtRow>
            Capacity
            <span>{formatSats(hoveredNode.capacity)}</span>
          </S.TtRow>
          <S.TtRow>
            Channels
            <span>{hoveredNode.channelCount.toLocaleString()}</span>
          </S.TtRow>
        </S.Tooltip>
      )}

      {selectedNode && (
        <S.DetailPanel>
          <S.DpClose onClick={() => setSelectedNode(null)}>
            <X size={16} />
          </S.DpClose>
          <S.DpAlias>{selectedNode.alias}</S.DpAlias>
          <S.DpPubkey>
            {selectedNode.id.substring(0, 24)}...
            <S.DpCopyBtn onClick={() => handleCopyPk(selectedNode.id)}>
              {copiedPk ? <Check size={12} /> : <Copy size={12} />}
            </S.DpCopyBtn>
          </S.DpPubkey>
          <S.DpStats>
            <S.DpStat>
              <S.DpStatLabel>Capacity</S.DpStatLabel>
              <S.DpStatVal>{formatSats(selectedNode.capacity)}</S.DpStatVal>
            </S.DpStat>
            <S.DpStat>
              <S.DpStatLabel>Channels</S.DpStatLabel>
              <S.DpStatVal>{selectedNode.channelCount.toLocaleString()}</S.DpStatVal>
            </S.DpStat>
          </S.DpStats>
          <S.DpActions>
            <S.DpActionBtn
              onClick={() =>
                window.open(
                  `https://mempool.space/lightning/node/${selectedNode.id}`,
                  '_blank',
                )
              }
            >
              <ExternalLink size={13} /> View on Mempool
            </S.DpActionBtn>
            <S.DpActionBtn onClick={() => handleCopyPk(selectedNode.id)}>
              {copiedPk ? <Check size={13} /> : <Copy size={13} />}
              {copiedPk ? 'Copied!' : 'Copy Node ID'}
            </S.DpActionBtn>
          </S.DpActions>
        </S.DetailPanel>
      )}

      {!bannerDismissed && !networkGraphStore.loading && (
        <S.Banner>
          <S.BannerText>
            <strong>Ready to join the network?</strong> Connect your Lightning node to
            manage channels and liquidity.
          </S.BannerText>
          <S.BannerBtn variant="primary" onClick={() => appView.goTo('/connect-node')}>
            <Link2 size={13} /> Connect
          </S.BannerBtn>
          <S.BannerBtn variant="secondary" onClick={() => appView.goTo('/get-node')}>
            <Server size={13} /> Get a Node
          </S.BannerBtn>
          <S.BannerClose onClick={() => setBannerDismissed(true)}>
            <X size={14} />
          </S.BannerClose>
        </S.Banner>
      )}
    </S.Wrapper>
  );
};

export default observer(ExploreNetworkPage);
