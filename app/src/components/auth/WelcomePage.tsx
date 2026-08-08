import React, { useRef, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error - three.js types require newer TS
import * as THREE from 'three';
import { useStore } from 'store';
import {
  Globe,
  Link2,
  Server,
  HelpCircle,
  X,
  Zap,
  Shield,
  ArrowLeftRight,
  ChevronRight,
} from 'lucide-react';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const S = {
  Wrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `,
  Canvas: styled.canvas`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  `,
  Scrim: styled.div`
    position: absolute;
    inset: 0;
    z-index: 1;
    background: radial-gradient(
      ellipse at center,
      rgba(3, 5, 8, 0.45) 0%,
      rgba(3, 5, 8, 0.7) 100%
    );
  `,
  Content: styled.div`
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 40px 24px;
    gap: 0;
  `,
  Header: styled.div`
    text-align: center;
    margin-bottom: 48px;
    animation: ${fadeUp} 0.6s ease both;
  `,
  WelcomeLabel: styled.div`
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.35);
    margin-bottom: 12px;
  `,
  Title: styled.h1`
    font-size: 42px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.05;
    color: #ffffff;
    margin: 0 0 12px;

    @media (max-width: 768px) {
      font-size: 32px;
    }
  `,
  Tagline: styled.p`
    font-size: 15px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
    line-height: 1.5;
    font-weight: 400;
  `,
  TileGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    max-width: 720px;
    width: 100%;
    animation: ${fadeUp} 0.6s ease both;
    animation-delay: 0.1s;

    @media (max-width: 680px) {
      grid-template-columns: 1fr;
      max-width: 360px;
    }
  `,
  Tile: styled.button`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 24px 20px;
    background: rgba(18, 20, 28, 0.92);
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: background 0.2s ease;
    text-align: left;
    color: #e5e7eb;
    font-family: inherit;
    min-height: 160px;

    &:hover {
      background: rgba(28, 31, 42, 0.95);
    }

    &:focus {
      outline: none;
    }

    &:active {
      background: rgba(35, 38, 50, 0.95);
    }
  `,
  TileIcon: styled.div`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.7);
  `,
  TileTitle: styled.div`
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 6px;
    color: #ffffff;
  `,
  TileDesc: styled.div`
    font-size: 13px;
    color: rgba(255, 255, 255, 0.35);
    line-height: 1.45;
    flex: 1;
  `,
  TileArrow: styled.div`
    position: absolute;
    top: 24px;
    right: 20px;
    color: rgba(255, 255, 255, 0.15);
    transition: color 0.2s ease;

    button:hover & {
      color: rgba(255, 255, 255, 0.4);
    }
  `,
  Footer: styled.div`
    margin-top: 40px;
    animation: ${fadeUp} 0.6s ease both;
    animation-delay: 0.2s;
  `,
  LearnLink: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.25);
    font-size: 13px;
    font-family: inherit;
    cursor: pointer;
    padding: 8px 0;
    transition: color 0.15s ease;
    font-weight: 400;

    &:hover {
      color: rgba(255, 255, 255, 0.5);
    }
  `,

  InfoOverlay: styled.div`
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(3, 5, 8, 0.8);
    backdrop-filter: blur(20px);
    padding: 24px;
  `,
  InfoPanel: styled.div`
    max-width: 480px;
    width: 100%;
    animation: ${fadeUp} 0.3s ease both;
    position: relative;
  `,
  InfoClose: styled.button`
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.06);
    border: none;
    border-radius: 10px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }
  `,
  InfoTitle: styled.h2`
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.03em;
    color: #ffffff;
    margin: 0 0 16px;
  `,
  InfoBody: styled.div`
    font-size: 15px;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.7;
    text-align: left;
  `,
  InfoFeatures: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 28px 0 32px;
  `,
  InfoFeature: styled.div`
    display: flex;
    align-items: flex-start;
    gap: 14px;
    text-align: left;
  `,
  InfoFeatureIcon: styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
  `,
  InfoFeatureText: styled.div`
    flex: 1;
  `,
  InfoFeatureTitle: styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 3px;
  `,
  InfoFeatureDesc: styled.div`
    font-size: 13px;
    color: rgba(255, 255, 255, 0.35);
    line-height: 1.5;
  `,
  InfoCTA: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
    }
  `,
};

const WelcomePage: React.FC = () => {
  const store = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      500,
    );
    cam.position.set(0, 0, 22);

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

    // Background stars
    const starCount = 2400;
    const sPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      const r = 8 + Math.random() * 90;
      sPos[i * 3] = r * Math.sin(p) * Math.cos(t);
      sPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      sPos[i * 3 + 2] = r * Math.cos(p);
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    const sMat = new THREE.PointsMaterial({
      color: 0x8b8fbf,
      size: 0.1,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
    });
    group.add(new THREE.Points(sGeo, sMat));

    // Glowing "network" nodes
    const nodeCount = 80;
    const colors = [0x8b5cf6, 0x6366f1, 0xa78bfa, 0x7c3aed];
    for (let i = 0; i < nodeCount; i++) {
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      const r = 5 + Math.random() * 30;
      const x = r * Math.sin(p) * Math.cos(t);
      const y = r * Math.sin(p) * Math.sin(t);
      const z = r * Math.cos(p);
      const sz = 0.03 + Math.random() * 0.08;
      const col = colors[Math.floor(Math.random() * colors.length)];

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(sz, 8, 8),
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.7,
        }),
      );
      core.position.set(x, y, z);
      group.add(core);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(sz * 2.5, 8, 8),
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.04,
        }),
      );
      glow.position.set(x, y, z);
      group.add(glow);
    }

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.00015;
      group.rotation.x += 0.00005;
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
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  if (!store.initialized) return null;

  return (
    <S.Wrapper>
      <S.Canvas ref={canvasRef} />
      <S.Scrim />
      <S.Content>
        <S.Header>
          <S.WelcomeLabel>Welcome to</S.WelcomeLabel>
          <S.Title>The Lightning Network</S.Title>
          <S.Tagline>Instant, low-cost, global payments built on Bitcoin.</S.Tagline>
        </S.Header>

        <S.TileGrid>
          <S.Tile onClick={() => store.appView.goTo('/explore-network')}>
            <S.TileArrow>
              <ChevronRight size={16} />
            </S.TileArrow>
            <S.TileIcon>
              <Globe size={20} />
            </S.TileIcon>
            <S.TileTitle>Explore</S.TileTitle>
            <S.TileDesc>
              Browse nodes, capacity, and topology — no node required
            </S.TileDesc>
          </S.Tile>

          <S.Tile onClick={() => store.appView.goTo('/connect-node')}>
            <S.TileArrow>
              <ChevronRight size={16} />
            </S.TileArrow>
            <S.TileIcon>
              <Link2 size={20} />
            </S.TileIcon>
            <S.TileTitle>Connect</S.TileTitle>
            <S.TileDesc>Securely pair with your Lightning node via LNC</S.TileDesc>
          </S.Tile>

          <S.Tile onClick={() => store.appView.goTo('/get-node')}>
            <S.TileArrow>
              <ChevronRight size={16} />
            </S.TileArrow>
            <S.TileIcon>
              <Server size={20} />
            </S.TileIcon>
            <S.TileTitle>Get a Node</S.TileTitle>
            <S.TileDesc>
              Hosted providers or self-host — get started in minutes
            </S.TileDesc>
          </S.Tile>
        </S.TileGrid>

        <S.Footer>
          <S.LearnLink onClick={() => setShowInfo(true)}>
            <HelpCircle size={14} />
            What is the Lightning Network?
          </S.LearnLink>
        </S.Footer>
      </S.Content>

      {showInfo && (
        <S.InfoOverlay onClick={() => setShowInfo(false)}>
          <S.InfoPanel onClick={e => e.stopPropagation()}>
            <S.InfoClose onClick={() => setShowInfo(false)}>
              <X size={16} />
            </S.InfoClose>
            <S.InfoTitle>The Lightning Network</S.InfoTitle>
            <S.InfoBody>
              A layer-2 payment protocol on top of Bitcoin. Near-instant transactions with
              extremely low fees through payment channels between nodes.
            </S.InfoBody>
            <S.InfoFeatures>
              <S.InfoFeature>
                <S.InfoFeatureIcon>
                  <Zap size={18} />
                </S.InfoFeatureIcon>
                <S.InfoFeatureText>
                  <S.InfoFeatureTitle>Instant Payments</S.InfoFeatureTitle>
                  <S.InfoFeatureDesc>
                    Transactions settle in milliseconds, not minutes.
                  </S.InfoFeatureDesc>
                </S.InfoFeatureText>
              </S.InfoFeature>
              <S.InfoFeature>
                <S.InfoFeatureIcon>
                  <ArrowLeftRight size={18} />
                </S.InfoFeatureIcon>
                <S.InfoFeatureText>
                  <S.InfoFeatureTitle>Negligible Fees</S.InfoFeatureTitle>
                  <S.InfoFeatureDesc>
                    Send any amount for fractions of a cent. No middlemen.
                  </S.InfoFeatureDesc>
                </S.InfoFeatureText>
              </S.InfoFeature>
              <S.InfoFeature>
                <S.InfoFeatureIcon>
                  <Shield size={18} />
                </S.InfoFeatureIcon>
                <S.InfoFeatureText>
                  <S.InfoFeatureTitle>Secured by Bitcoin</S.InfoFeatureTitle>
                  <S.InfoFeatureDesc>
                    All channels backed by real on-chain Bitcoin.
                  </S.InfoFeatureDesc>
                </S.InfoFeatureText>
              </S.InfoFeature>
              <S.InfoFeature>
                <S.InfoFeatureIcon>
                  <Globe size={18} />
                </S.InfoFeatureIcon>
                <S.InfoFeatureText>
                  <S.InfoFeatureTitle>Global Network</S.InfoFeatureTitle>
                  <S.InfoFeatureDesc>
                    Thousands of nodes routing payments across an open, permissionless
                    network.
                  </S.InfoFeatureDesc>
                </S.InfoFeatureText>
              </S.InfoFeature>
            </S.InfoFeatures>
            <S.InfoCTA onClick={() => setShowInfo(false)}>Got it</S.InfoCTA>
          </S.InfoPanel>
        </S.InfoOverlay>
      )}
    </S.Wrapper>
  );
};

export default observer(WelcomePage);
