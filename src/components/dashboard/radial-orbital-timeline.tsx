"use client";
import React, { useState, useEffect, useRef } from "react";
import { Info, FileText, Play, Users } from "lucide-react";
import RadialOrbitalTimelineItem from "./RadialOrbitalTimelineItem";
import RadialOrbitalTimelineCard from "./RadialOrbitalTimelineCard";
// @ts-ignore
import { BGPattern } from '@/components/ui/bg-pattern';

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category?: string;
  icon?: React.ElementType;
  relatedIds: number[];
  status?: "completed" | "in-progress" | "pending";
  energy?: number;
  _posX?: number;
  _posY?: number;
  _zIndex?: number;
  _opacity?: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const viewMode: "orbital" = "orbital";
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: number | undefined;

    if (autoRotate && viewMode === "orbital") {
      rotationTimer = window.setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50) as unknown as number;
    }

    return () => {
      if (rotationTimer) {
        window.clearInterval(rotationTimer);
      }
    };
  }, [autoRotate, viewMode]);

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 200;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center bg-black overflow-hidden"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* dotted red background pattern removed - now handled by parent section */}

          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-[#2a0303] via-[#7a0000] to-[#FF073A] animate-pulse flex items-center justify-center z-10">
            <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70"></div>
            <div className="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md"></div>
          </div>

          <div className="absolute w-96 h-96 rounded-full border border-white/10"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = !!expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = !!pulseEffect[item.id];

            const itemWithPos: TimelineItem = {
              ...item,
              _posX: position.x,
              _posY: position.y,
              _zIndex: position.zIndex,
              _opacity: position.opacity,
            };

            return (
              <div key={item.id}>
                <RadialOrbitalTimelineItem
                  item={itemWithPos}
                  isExpanded={isExpanded}
                  isRelated={isRelated}
                  isPulsing={isPulsing}
                  onToggle={toggleItem}
                />

                {isExpanded && (
                  <RadialOrbitalTimelineCard
                    item={item}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Demo export with 4 nodes as requested
export function RadialOrbitalTimelineDemo() {
  const demoData: TimelineItem[] = [
    {
      id: 1,
      title: 'About Us',
      date: '',
      content: 'We are passionate developers building modern multiplayer gaming experiences with cutting-edge web technologies.',
      icon: Info,
      relatedIds: [2],
    },
    {
      id: 2,
      title: 'Project',
      date: '',
      content: 'A real-time multiplayer Tetris game featuring neon aesthetics, competitive gameplay, and seamless online battles.',
      icon: FileText,
      relatedIds: [1, 3, 4],
    },
    {
      id: 3,
      title: 'Single Player',
      date: '',
      content: 'Hone your skills with AI opponents and take on daily challenges to master the mechanics.',
      icon: Play,
      relatedIds: [2, 4],
    },
    {
      id: 4,
      title: 'Multiplayer',
      date: '',
      content: 'Create rooms, invite friends, and compete in real-time multiplayer matches. Last one standing wins!',
      icon: Users,
      relatedIds: [2, 3],
    },
  ];

  return <RadialOrbitalTimeline timelineData={demoData} />;
}
