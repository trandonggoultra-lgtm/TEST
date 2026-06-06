import React, { useState, useRef, useEffect } from "react";
import { 
  Type as LucideType, 
  Trash2, 
  RotateCcw, 
  Maximize2, 
  Undo2, 
  FileDown, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  MousePointer, 
  CircleDot, 
  Milestone, 
  Slash, 
  Eye, 
  Plus, 
  Minus, 
  Maximize 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Point, Line, Circle, SolutionStep, SolvedResponse } from "./types";

// Default initial state matching S.ABCD Pyramid example
const INITIAL_POINTS: Point[] = [
  { id: "p0", label: "A", x: 250, y: 320 },
  { id: "p1", label: "B", x: 340, y: 400 },
  { id: "p2", label: "C", x: 580, y: 400 },
  { id: "p3", label: "D", x: 490, y: 320 },
  { id: "p4", label: "O", x: 415, y: 360 },
  { id: "p5", label: "S", x: 250, y: 120 },
  { id: "p6", label: "H", x: 310, y: 207 }
];

const INITIAL_LINES: Line[] = [
  { id: "l0", p1: "p5", p2: "p0", dashed: false, color: "var(--draw-black)" }, // SA
  { id: "l1", p1: "p5", p2: "p1", dashed: false, color: "var(--draw-black)" }, // SB
  { id: "l2", p1: "p5", p2: "p2", dashed: false, color: "var(--draw-black)" }, // SC
  { id: "l3", p1: "p5", p2: "p3", dashed: false, color: "var(--draw-black)" }, // SD
  { id: "l4", p1: "p0", p2: "p1", dashed: false, color: "var(--draw-black)" }, // AB
  { id: "l5", p1: "p1", p2: "p2", dashed: false, color: "var(--draw-black)" }, // BC
  { id: "l6", p1: "p2", p2: "p3", dashed: false, color: "var(--draw-black)" }, // CD
  { id: "l7", p1: "p3", p2: "p0", dashed: true, color: "var(--draw-black)" },  // DA
  { id: "l8", p1: "p0", p2: "p2", dashed: true, color: "var(--draw-black)" },  // AC
  { id: "l9", p1: "p1", p2: "p3", dashed: true, color: "var(--draw-black)" },  // BD
  { id: "l10", p1: "p5", p2: "p4", dashed: true, color: "var(--draw-black)" }, // SO
  { id: "l11", p1: "p0", p2: "p6", dashed: true, color: "var(--draw-black)" }  // AH
];

const INITIAL_STEPS: SolutionStep[] = [
  {
    title: "1. BÀI GIẢI CHI TIẾT",
    content: `<p>Từ giả thiết, ta có hình chóp <span class="math-expr">S.ABCD</span> với đáy <span class="math-expr">ABCD</span> là hình vuông tâm <span class="math-expr">O</span>.</p>
              <p>Đường thẳng <span class="math-expr">SA</span> vuông góc với mặt phẳng đáy <span class="math-expr">(ABCD)</span>.</p>
              <p>Vì <span class="math-expr">SA ⊥ (ABCD)</span> nên <span class="math-expr">SA</span> vuông góc với mọi đường thẳng nằm trong mặt phẳng <span class="math-expr">(ABCD)</span> đi qua <span class="math-expr">A</span>.</p>
              <p>Suy ra: <strong>SA ⊥ AB</strong> và <strong>SA ⊥ AD</strong>.</p>
              <p><span class="math-expr">O</span> là tâm hình vuông <span class="math-expr">ABCD</span> nên <span class="math-expr">O</span> là trung điểm của <span class="math-expr">AC</span> và <span class="math-expr">BD</span>, đồng thời <strong>AC ⊥ BD</strong>.</p>`
  },
  {
    title: "2. XÁC ĐỊNH GIAO TUYẾN CỦA CÁC MẶT PHẲNG",
    content: `<p>Để giải quyết các bài toán về góc và khoảng cách, việc xác định giao tuyến là bước nền tảng.</p>
              <p>Xét mặt phẳng <span class="math-expr">(SBD)</span> và mặt phẳng <span class="math-expr">(ABCD)</span>:</p>
              <p>Hai mặt phẳng này có chung điểm <span class="math-expr">B</span> và <span class="math-expr">D</span>. Do đó giao tuyến của chúng là đường thẳng <span class="math-expr">BD</span>.</p>
              <p>Xét mặt phẳng <span class="math-expr">(SAC)</span> và <span class="math-expr">(SBD)</span>:</p>
              <p>Giao tuyến là đường thẳng <span class="math-expr">SO</span>, vì <span class="math-expr">S</span> là điểm chung thứ nhất, và <span class="math-expr">O = AC ∩ BD</span> là điểm chung thứ hai.</p>`
  },
  {
    title: "3. TÌM CÁC ĐƯỜNG THẲNG VUÔNG GÓC",
    content: `<p>Ta đi chứng minh <span class="math-expr">BD ⊥ (SAC)</span>.</p>
              <p>Thật vậy:</p>
              <p>1. <span class="math-expr">BD ⊥ AC</span> (tính chất đường chéo hình vuông).</p>
              <p>2. <span class="math-expr">BD ⊥ SA</span> (vì <span class="math-expr">SA ⊥ (ABCD)</span> và <span class="math-expr">BD ⊂ (ABCD)</span>).</p>
              <p>Vì <span class="math-expr">AC</span> và <span class="math-expr">SA</span> là hai đường thẳng cắt nhau trong mặt phẳng <span class="math-expr">(SAC)</span>, suy ra <strong>BD ⊥ (SAC)</strong>.</p>`
  },
  {
    title: "4. CHỨNG MINH THEO QUAN HỆ VUÔNG GÓC",
    content: `<p>Đề bài cho <span class="math-expr">H</span> là hình chiếu vuông góc của <span class="math-expr">A</span> lên <span class="math-expr">SO</span>, tức là <strong>AH ⊥ SO</strong>.</p>
              <p>Từ chứng minh trên, ta có <span class="math-expr">BD ⊥ (SAC)</span>.</p>
              <p>Mà <span class="math-expr">AH ⊂ (SAC)</span>, nên suy ra <strong>BD ⊥ AH</strong>.</p>
              <p>Ta có hệ thức:</p>
              <p>• <span class="math-expr">AH ⊥ SO</span></p>
              <p>• <span class="math-expr">AH ⊥ BD</span></p>
              <p>Vì <span class="math-expr">SO</span> và <span class="math-expr">BD</span> cắt nhau tại <span class="math-expr">O</span> trong mặt phẳng <span class="math-expr">(SBD)</span>, ta kết luận được <strong>AH ⊥ (SBD)</strong>.</p>`
  },
  {
    title: "5. KẾT LUẬN SƯ PHẠM VVIP",
    content: `<p>Qua quá trình phân tích và chứng minh từng bước bằng phương pháp tổng hợp hình học không gian, ta đã xác định được:</p>
              <p>- Quan hệ vuông góc giữa cạnh bên và mặt đáy: <span class="math-expr">SA ⊥ (ABCD)</span>.</p>
              <p>- Quan hệ vuông góc giữa đường chéo đáy và mặt phẳng đứng: <span class="math-expr">BD ⊥ (SAC)</span>.</p>
              <p>- Chứng minh được đường cao hạ từ <span class="math-expr">A</span> xuống mặt phẳng nghiêng: <strong>AH ⊥ (SBD)</strong>.</p>
              <p>Đây là bài toán kinh điển giúp rèn luyện tư duy không gian và khả năng nhìn hình chiếu cho học sinh THPT.</p>`
  }
];

const INITIAL_FACTS = [
  "Mô hình: Hình chóp tứ giác S.ABCD",
  "Đáy ABCD là hình vuông tâm O",
  "SA ⊥ mặt phẳng đáy (ABCD)",
  "H là hình chiếu của A lên SO",
  "Trạng thái: AI đã dựng hình & viết giải chi tiết"
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function App() {
  const [problemText, setProblemText] = useState(
    "Cho hình chóp S.ABCD có đáy ABCD là hình vuông tâm O, SA vuông góc với mặt phẳng đáy. Gọi H là hình chiếu của A lên SO. Hãy vẽ hình và trình bày lời giải chi tiết."
  );
  
  // Image states
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  
  // Workspace Geometry States
  const [points, setPoints] = useState<Point[]>(INITIAL_POINTS);
  const [lines, setLines] = useState<Line[]>(INITIAL_LINES);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [facts, setFacts] = useState<string[]>(INITIAL_FACTS);
  const [solutionSteps, setSolutionSteps] = useState<SolutionStep[]>(INITIAL_STEPS);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  
  // Undo/Redo history stack
  const [history, setHistory] = useState<Array<{ points: Point[]; lines: Line[]; circles: Circle[] }>>([]);

  // Drawing config
  const [currentTool, setCurrentTool] = useState<"select" | "point" | "line" | "circle" | "eraser">("select");
  const [strokeColor, setStrokeColor] = useState<string>("var(--draw-black)");
  const [strokeWidth, setStrokeWidth] = useState<number>(1.5);
  const [isDashed, setIsDashed] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // SVG Canvas viewport states (Zoom/Pan)
  const [scale, setScale] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Interaction temporary variables
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<{ type: "point" | "line" | "circle"; id: string } | null>(null);
  const [drawingStartPoint, setDrawingStartPoint] = useState<Point | null>(null);
  const [tempDrawingEndCoord, setTempDrawingEndCoord] = useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPanOffset, setStartPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const canvasRef = useRef<SVGSVGElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Register state to history
  const pushToHistory = (newPoints = points, newLines = lines, newCircles = circles) => {
    setHistory(prev => {
      const snap = { 
        points: JSON.parse(JSON.stringify(newPoints)), 
        lines: JSON.parse(JSON.stringify(newLines)), 
        circles: JSON.parse(JSON.stringify(newCircles)) 
      };
      const updated = [...prev, snap];
      if (updated.length > 30) updated.shift(); // Keep limit of 30
      return updated;
    });
  };

  // Run initial save on load
  useEffect(() => {
    pushToHistory(INITIAL_POINTS, INITIAL_LINES, []);
  }, []);

  // Hotkeys helper mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when user is typing in textarea
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") {
        return;
      }
      switch (e.key.toLowerCase()) {
        case "v":
          setCurrentTool("select");
          break;
        case "p":
          setCurrentTool("point");
          break;
        case "l":
          setCurrentTool("line");
          break;
        case "c":
          setCurrentTool("circle");
          break;
        case "e":
          setCurrentTool("eraser");
          break;
        case "delete":
        case "backspace":
          handleDeleteSelected();
          break;
        case "z":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, points, lines, circles, history]);

  // Compute SVG client-coordinates to local grid coordinates
  const getLocalCoordinates = (clientX: number, clientY: number): { x: number; y: number } => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - panX) / scale;
    const y = (clientY - rect.top - panY) / scale;
    return { x, y };
  };

  // Smart label generator for alphabet names
  const generateNextLabel = (currentPoints: Point[]) => {
    const usedLabels = new Set(currentPoints.map(p => p.label));
    for (let i = 0; i < ALPHABET.length; i++) {
      if (!usedLabels.has(ALPHABET[i])) {
        return ALPHABET[i];
      }
    }
    // Fallback if alphabetical exceeds 26
    let num = 1;
    while (usedLabels.has(`P${num}`)) {
      num++;
    }
    return `P${num}`;
  };

  // Find nearest point for snapping
  const findNearestPoint = (x: number, y: number, currentPoints = points, threshold = 15): Point | null => {
    let nearest: Point | null = null;
    let minDist = threshold / scale; // adaptive scale snap
    
    currentPoints.forEach(p => {
      const dist = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    });
    return nearest;
  };

  // Drawing state management
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // Check for middle click drag pan or space bar drag pan
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setStartPanOffset({ x: e.clientX - panX, y: e.clientY - panY });
      return;
    }

    if (e.button !== 0) return; // Left click only

    const { x, y } = getLocalCoordinates(e.clientX, e.clientY);

    if (currentTool === "point") {
      const label = generateNextLabel(points);
      const newPoint: Point = {
        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        label,
        x: Math.round(x),
        y: Math.round(y)
      };
      const updated = [...points, newPoint];
      setPoints(updated);
      pushToHistory(updated, lines, circles);
    } 
    else if (currentTool === "line" || currentTool === "circle") {
      // Snap to point if clicked near one, otherwise project a new point natively
      let startPt = findNearestPoint(x, y);
      if (!startPt) {
        const label = generateNextLabel(points);
        startPt = {
          id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          label,
          x: Math.round(x),
          y: Math.round(y)
        };
        const updatedPoints = [...points, startPt];
        setPoints(updatedPoints);
        pushToHistory(updatedPoints, lines, circles);
      }
      setDrawingStartPoint(startPt);
      setTempDrawingEndCoord({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = getLocalCoordinates(e.clientX, e.clientY);
    setMouseCoord({ x: Math.round(x), y: Math.round(y) });

    if (isPanning) {
      setPanX(e.clientX - startPanOffset.x);
      setPanY(e.clientY - startPanOffset.y);
      return;
    }

    if (draggedPointId && currentTool === "select") {
      setPoints(prev => 
        prev.map(p => p.id === draggedPointId ? { ...p, x: Math.round(x), y: Math.round(y) } : p)
      );
      return;
    }

    if (drawingStartPoint && (currentTool === "line" || currentTool === "circle")) {
      setTempDrawingEndCoord({ x, y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (draggedPointId) {
      pushToHistory();
      setDraggedPointId(null);
      return;
    }

    if (drawingStartPoint && tempDrawingEndCoord) {
      const { x, y } = getLocalCoordinates(e.clientX, e.clientY);
      const snapTarget = findNearestPoint(x, y);
      
      let endPt = snapTarget;
      let nextPoints = [...points];

      // If no snap target, instantiate a new point on release
      if (!endPt && Math.sqrt((drawingStartPoint.x - x) ** 2 + (drawingStartPoint.y - y) ** 2) > 5) {
        const label = generateNextLabel(points);
        endPt = {
          id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          label,
          x: Math.round(x),
          y: Math.round(y)
        };
        nextPoints = [...points, endPt];
        setPoints(nextPoints);
      }

      if (endPt && endPt.id !== drawingStartPoint.id) {
        if (currentTool === "line") {
          const newLine: Line = {
            id: `l_${Date.now()}`,
            p1: drawingStartPoint.id,
            p2: endPt.id,
            dashed: isDashed,
            color: strokeColor,
            width: strokeWidth
          };
          const nextLines = [...lines, newLine];
          setLines(nextLines);
          pushToHistory(nextPoints, nextLines, circles);
        } else if (currentTool === "circle") {
          const r = Math.sqrt((endPt.x - drawingStartPoint.x) ** 2 + (endPt.y - drawingStartPoint.y) ** 2);
          if (r > 5) {
            const newCircle: Circle = {
              id: `c_${Date.now()}`,
              cx: drawingStartPoint.x,
              cy: drawingStartPoint.y,
              r,
              dashed: isDashed,
              color: strokeColor,
              width: strokeWidth
            };
            const nextCircles = [...circles, newCircle];
            setCircles(nextCircles);
            pushToHistory(nextPoints, lines, nextCircles);
          }
        }
      }

      setDrawingStartPoint(null);
      setTempDrawingEndCoord(null);
    }
  };

  // Zoom manipulation
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.15, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.15, 0.4));
  const handleResetZoomPan = () => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  };

  const handleCanvasWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = 0.08;
    const { x, y } = getLocalCoordinates(e.clientX, e.clientY);
    const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
    const nextScale = Math.max(0.4, Math.min(scale + delta, 4));
    
    if (nextScale !== scale) {
      // Pan correction to center zoom on mouse
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setPanX(e.clientX - rect.left - x * nextScale);
        setPanY(e.clientY - rect.top - y * nextScale);
        setScale(nextScale);
      }
    }
  };

  // Eraser utility & Clicking items
  const handlePointClick = (e: React.MouseEvent, pt: Point) => {
    e.stopPropagation();
    if (currentTool === "select") {
      setDraggedPointId(pt.id);
      setSelectedElementId({ type: "point", id: pt.id });
    } else if (currentTool === "eraser") {
      // Erase point and any bound lines/circles
      const filteredPts = points.filter(p => p.id !== pt.id);
      const filteredLines = lines.filter(l => l.p1 !== pt.id && l.p2 !== pt.id);
      setPoints(filteredPts);
      setLines(filteredLines);
      setSelectedElementId(null);
      pushToHistory(filteredPts, filteredLines, circles);
    }
  };

  const handleLineClick = (e: React.MouseEvent, line: Line) => {
    e.stopPropagation();
    if (currentTool === "select") {
      setSelectedElementId({ type: "line", id: line.id });
    } else if (currentTool === "eraser") {
      const filteredLines = lines.filter(l => l.id !== line.id);
      setLines(filteredLines);
      setSelectedElementId(null);
      pushToHistory(points, filteredLines, circles);
    }
  };

  const handleCircleClick = (e: React.MouseEvent, circ: Circle) => {
    e.stopPropagation();
    if (currentTool === "select") {
      setSelectedElementId({ type: "circle", id: circ.id });
    } else if (currentTool === "eraser") {
      const filteredCircles = circles.filter(c => c.id !== circ.id);
      setCircles(filteredCircles);
      setSelectedElementId(null);
      pushToHistory(points, lines, filteredCircles);
    }
  };

  // Keyboard Delete button
  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    if (selectedElementId.type === "point") {
      const filteredPts = points.filter(p => p.id !== selectedElementId.id);
      const filteredLines = lines.filter(l => l.p1 !== selectedElementId.id && l.p2 !== selectedElementId.id);
      setPoints(filteredPts);
      setLines(filteredLines);
      pushToHistory(filteredPts, filteredLines, circles);
    } else if (selectedElementId.type === "line") {
      const filteredLines = lines.filter(l => l.id !== selectedElementId.id);
      setLines(filteredLines);
      pushToHistory(points, filteredLines, circles);
    } else if (selectedElementId.type === "circle") {
      const filteredCircles = circles.filter(c => c.id !== selectedElementId.id);
      setCircles(filteredCircles);
      pushToHistory(points, lines, filteredCircles);
    }
    setSelectedElementId(null);
  };

  // Undo implementation
  const handleUndo = () => {
    if (history.length > 1) {
      const updatedHistory = [...history];
      updatedHistory.pop(); // Pop current state
      const previousState = updatedHistory[updatedHistory.length - 1];
      
      setPoints(JSON.parse(JSON.stringify(previousState.points)));
      setLines(JSON.parse(JSON.stringify(previousState.lines)));
      setCircles(JSON.parse(JSON.stringify(previousState.circles)));
      setHistory(updatedHistory);
      setSelectedElementId(null);
    } else if (history.length === 1) {
      // Clear entirely
      setPoints([]);
      setLines([]);
      setCircles([]);
      setHistory([]);
      setSelectedElementId(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ bản thiết kế này?")) {
      setPoints([]);
      setLines([]);
      setCircles([]);
      setSelectedElementId(null);
      pushToHistory([], [], []);
    }
  };

  // Change existing elements attributes when modified in selection panel
  const handleUpdateSelectedStroke = (width: number, dashed: boolean, color: string) => {
    if (!selectedElementId) return;
    if (selectedElementId.type === "line") {
      const nextLines = lines.map(l => l.id === selectedElementId.id ? { ...l, width, dashed, color } : l);
      setLines(nextLines);
      pushToHistory(points, nextLines, circles);
    } else if (selectedElementId.type === "circle") {
      const nextCircles = circles.map(c => c.id === selectedElementId.id ? { ...c, width, dashed, color } : c);
      setCircles(nextCircles);
      pushToHistory(points, lines, nextCircles);
    }
  };

  // Handle uploaded problem graphic (OCR decodes inside the Gemini AI solver)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = file.type;
      setImageMime(mime);
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result && typeof evt.target.result === "string") {
          const base64Data = evt.target.result;
          setPreviewImage(base64Data);
          // Automatically trigger the solver with this loaded image!
          handleProcessAISolve(base64Data, mime);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Main API Caller for solving visual & text geometry challenge
  const handleProcessAISolve = async (forcedImageBase64?: string | null, forcedImageMime?: string | null) => {
    setIsLoading(true);
    try {
      const payload = {
        problemText,
        imageBase64: forcedImageBase64 !== undefined ? forcedImageBase64 : previewImage,
        imageMime: forcedImageMime !== undefined ? forcedImageMime : imageMime
      };

      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối đến máy chủ AI.");
      }

      const responseData: SolvedResponse = await response.json();

      // Clear layout and parse incoming structure
      const parsedPoints: Point[] = responseData.points.map(p => ({
        id: p.id,
        label: p.label,
        x: Number(p.x),
        y: Number(p.y)
      }));

      const parsedLines: Line[] = responseData.lines.map((l, index) => ({
        id: `l_ai_${index}_${Date.now()}`,
        p1: l.p1,
        p2: l.p2,
        dashed: Boolean(l.dashed),
        color: l.color || "var(--draw-black)",
        width: 1.5
      }));

      const parsedCircles: Circle[] = responseData.circles.map((c, index) => ({
        id: `c_ai_${index}_${Date.now()}`,
        cx: Number(c.cx),
        cy: Number(c.cy),
        r: Number(c.r),
        dashed: Boolean(c.dashed),
        color: c.color || "var(--draw-black)",
        width: 1.5
      }));

      setPoints(parsedPoints);
      setLines(parsedLines);
      setCircles(parsedCircles);
      setFacts(responseData.extractedFacts || []);
      setSolutionSteps(responseData.steps || []);
      setActiveStepIndex(0);

      // Reset Zoom position to let points fit
      setScale(1);
      setPanX(0);
      setPanY(0);

      pushToHistory(parsedPoints, parsedLines, parsedCircles);

    } catch (err: any) {
      console.error(err);
      alert(`Đã xảy ra lỗi khi AI giải toán: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Word Doc generating base64 image representation
  const handleExportWord = () => {
    if (!canvasRef.current) return;

    // Convert SVG element to temporary XML representation and encode base64
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(canvasRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Scale canvas sizes and prepare drawing
    const rect = canvasRef.current.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;

    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL("image/png");

        let fullSolutionHTML = "";
        solutionSteps.forEach((s, i) => {
          fullSolutionHTML += `<h4>Bước ${i + 1}: ${s.title}</h4>${s.content}<br/>`;
        });

        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>AI Geometry Report</title></head><body style='font-family: Arial, sans-serif;'>";
        const footer = "</body></html>";
        
        const docHTML = header + `
          <h2 style="color: #4f46e5; text-align: center;">BÀI TẬP VÀ GIẢI PHÁP HÌNH HỌC VVIP</h2>
          <hr>
          <h3>1. ĐỀ BÀI:</h3>
          <p style="font-size: 12pt; line-height: 1.6; background-color: #f3f4f6; padding: 10px; border-radius: 6px;">${problemText}</p>
          
          <h3>2. HÌNH VẼ MINH HỌA:</h3>
          <p style="text-align: center;">
            <img src="${base64Image}" style="max-width: 100%; max-height: 380px; border: 1px solid #cbd5e1;" alt="Hình vẽ"/>
          </p>

          <h3>3. LỜI GIẢI CHI TIẾT SƯ PHẠM:</h3>
          <div style="font-size: 11pt; line-height: 1.6;">
            ${fullSolutionHTML}
          </div>
        ` + footer;

        const blob = new Blob(['\ufeff', docHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `VVIP_Giai_Tich_Hinh_Hoc_${Date.now()}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
  };

  // Convert SVG to PNG
  const handleExportPNG = () => {
    if (!canvasRef.current) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(canvasRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Scale and size
    const rect = canvasRef.current.getBoundingClientRect();
    canvas.width = 1600; // Force high-res
    canvas.height = 1000;

    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Fit coordinates nicely centered
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const a = document.createElement("a");
        a.download = `VVIP_Hinh_Hoc_Chuan_Bi_${Date.now()}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
  };

  // Save as PDF by leveraging browsers high-fidelity layout printing
  const handleExportPDF = () => {
    window.print();
  };

  // Toggle canvas full height
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] select-none font-sans overflow-hidden">
      
      {/* TOPBAR */}
      <header className="h-[60px] border-b border-[#3f3f46] px-5 flex justify-between items-center bg-[#09090b] shadow-xl z-20 print-hide shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-[#4f46e5] to-[#9333ea] rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">V</div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-wider uppercase text-[#f4f4f5]">SIÊU APP VẼ HÌNH HỌC THÔNG MINH - VVIP</h1>
            <span className="text-[10px] text-[#818cf8] font-bold tracking-widest uppercase">AI GEOMETRY ENGINE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button 
            id="btn-export-word"
            onClick={handleExportWord} 
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#27272a] border border-[#3f3f46] hover:bg-[#3f3f46] rounded-lg transition duration-200 cursor-pointer shadow-md"
          >
            <FileText className="w-3.5 h-3.5 text-[#3b82f6]" />
            TẢI WORD
          </button>
          
          <button 
            id="btn-export-pdf"
            onClick={handleExportPDF} 
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#27272a] border border-[#3f3f46] hover:bg-[#3f3f46] rounded-lg transition duration-200 cursor-pointer shadow-md"
          >
            <FileDown className="w-3.5 h-3.5 text-[#ef4444]" />
            TẢI PDF
          </button>

          <button 
            id="btn-export-png"
            onClick={handleExportPNG} 
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#27272a] border border-[#3f3f46] hover:bg-[#3f3f46] rounded-lg transition duration-200 cursor-pointer shadow-md"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#10b981]" />
            TẢI PNG
          </button>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden min-w-0 relative">
        
        {/* LEFT COLUMN: QUERY & FACTS INPUT PANEL */}
        <aside className="w-80 bg-[#18181b] border-r border-[#3f3f46] flex flex-col shrink-0 print-hide z-10 transition-all duration-300">
          <div className="px-5 py-3.5 text-xs font-bold tracking-widest text-[#e4e4e7] border-b border-[#3f3f46] uppercase shrink-0">
            PHÂN TÍCH ĐỀ BÀI VÀ AI SOLVER
          </div>
          
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
            
            {/* PROBLEM INPUT */}
            <div className="flex flex-col gap-2">
              <label htmlFor="problem-text-area" className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Nội dung bài toán</label>
              <textarea
                id="problem-text-area"
                className="w-full h-32 bg-[#27272a] border border-[#3f3f46] hover:border-zinc-500 rounded-lg p-3 text-xs leading-relaxed text-[#f4f4f5] outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition duration-200 resize-none font-sans"
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Nhập đề toán hình học tại đây (2D, 3D, tính toán diện tích, chứng minh vuông góc...)"
              />
            </div>

            {/* AI DRIVEN ACTIONS */}
            <div className="flex gap-2">
              <button 
                id="btn-image-trigger"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-lg text-xs font-bold bg-[#27272a] hover:bg-[#3f3f46] text-[#e4e4e7] transition duration-200 border border-[#3f3f46] cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Dựng từ Ảnh
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                accept="image/*" 
                onChange={handleImageUpload} 
              />

              <button 
                id="btn-process-ai"
                onClick={handleProcessAISolve}
                className="flex-1 flex justify-center items-center gap-1.5 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-tr from-[#4f46e5] to-[#9333ea] hover:brightness-110 shadow-lg active:scale-95 transition duration-200 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Xử lý & Vẽ
              </button>
            </div>

            {/* PREVIEW IMAGE BLOCK */}
            {previewImage && (
              <div className="relative w-full h-[120px] bg-[#27272a] rounded-lg border border-[#3f3f46] overflow-hidden flex items-center justify-center">
                <img src={previewImage} className="max-w-full max-h-full object-contain" alt="OCR Preview" />
                <button 
                  id="btn-remove-image"
                  onClick={() => { setPreviewImage(null); setImageMime(null); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-zinc-900/80 hover:bg-red-600 border border-zinc-700 flex items-center justify-center text-white cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* FACTS EXTRACTED BENTO BOX */}
            <div className="flex flex-col gap-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">DỮ KIỆN TRÍCH XUẤT từ AI</div>
              <div className="flex flex-col gap-1.5">
                {facts.length === 0 ? (
                  <div className="text-xs text-zinc-500 italic p-3 text-center border border-zinc-800 rounded-lg">Chưa có dữ kiện phân tích</div>
                ) : (
                  facts.map((fact, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -5 }} 
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2.5 bg-zinc-900/40 p-2.5 rounded-lg border border-[#27272a] hover:bg-zinc-800/30 transition duration-150"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#4f46e5] mt-1.5 shrink-0 block shadow-[0_0_8px_rgba(79,70,229,0.7)]" />
                      <span className="text-xs leading-relaxed text-zinc-300 font-medium">{fact}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* USER WORKSPACE ADVISORY */}
            <div className="mt-auto bg-[#4f46e5]/10 border-l-[3px] border-[#4f46e5] p-3 text-[11px] leading-relaxed text-indigo-300 rounded-r-lg">
              Sử dụng các thanh công cụ Vẽ bên phải để thêm điểm, tự nối đoạn thẳng, vẽ hình tròn, kéo thả tùy biến hoặc để AI tự vẽ và chứng minh.
            </div>

          </div>
        </aside>

        {/* CENTER COLUMN: CANVAS & SOLUTION SCREEN */}
        <main className="flex-1 flex flex-col bg-white min-w-0 relative">
          
          {/* CANVAS WORKSPACE PORT */}
          <div className={`relative ${isFullscreen ? "h-full" : "h-[50%]"} border-b border-[#e2e8f0] overflow-hidden bg-white select-none`}>
            
            <svg
              ref={canvasRef}
              id="geometry-work-canvas"
              className="w-full h-full block cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleCanvasWheel}
            >
              {/* Dynamic Coordinate Dotted Grid pattern and Premium filters */}
              <defs>
                {showGrid && (
                  <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="#cbd5e1" opacity="0.85" />
                  </pattern>
                )}
                {/* Clean drop shadow for point indicators */}
                <filter id="point-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.15" />
                </filter>
                <filter id="selected-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#4f46e5" floodOpacity="0.4" />
                </filter>
              </defs>
              {showGrid && (
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              )}

              {/* TRANSLATED VIEWPORT GROUP */}
              <g transform={`translate(${panX}, ${panY}) scale(${scale})`}>
                
                {/* DRAWN CIRCLES */}
                {circles.map(c => {
                  const isSelected = selectedElementId?.type === "circle" && selectedElementId?.id === c.id;
                  return (
                    <motion.circle
                      id={c.id}
                      key={c.id}
                      animate={{
                        cx: c.cx,
                        cy: c.cy,
                        r: c.r
                      }}
                      transition={
                        draggedPointId
                          ? { type: "tween", duration: 0 }
                          : { type: "spring", stiffness: 140, damping: 18 }
                      }
                      fill="transparent"
                      stroke={isSelected ? "#4f46e5" : c.color}
                      strokeWidth={(c.width || strokeWidth) * (isSelected ? 1.8 : 1)}
                      strokeDasharray={c.dashed ? "6,6" : undefined}
                      className="cursor-pointer transition-colors duration-150"
                      onClick={(e) => handleCircleClick(e, c)}
                    />
                  );
                })}

                {/* DRAWN SEGMENTS / LINES */}
                {lines.map(l => {
                  const p1 = points.find(p => p.id === l.p1);
                  const p2 = points.find(p => p.id === l.p2);
                  if (!p1 || !p2) return null;
                  
                  const isSelected = selectedElementId?.type === "line" && selectedElementId?.id === l.id;
                  const isDraggingAttached = draggedPointId === l.p1 || draggedPointId === l.p2;
                  return (
                    <motion.line
                      id={l.id}
                      key={l.id}
                      animate={{
                        x1: p1.x,
                        y1: p1.y,
                        x2: p2.x,
                        y2: p2.y
                      }}
                      transition={
                        isDraggingAttached
                          ? { type: "tween", duration: 0 }
                          : { type: "spring", stiffness: 140, damping: 18 }
                      }
                      stroke={isSelected ? "#4f46e5" : l.color}
                      strokeWidth={(l.width || strokeWidth) * (isSelected ? 2 : 1)}
                      strokeDasharray={l.dashed ? "6,5" : undefined}
                      className="cursor-pointer transition-all duration-150"
                      onClick={(e) => handleLineClick(e, l)}
                    />
                  );
                })}

                {/* VISUAL FEEDBACK: TEMPORARY PLOTTING LINE */}
                {drawingStartPoint && tempDrawingEndCoord && currentTool === "line" && (
                  <line
                    x1={drawingStartPoint.x}
                    y1={drawingStartPoint.y}
                    x2={tempDrawingEndCoord.x}
                    y2={tempDrawingEndCoord.y}
                    stroke="rgba(79, 70, 229, 0.6)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={isDashed ? "6,6" : undefined}
                  />
                )}

                {/* VISUAL FEEDBACK: TEMPORARY PLOTTING CIRCLE */}
                {drawingStartPoint && tempDrawingEndCoord && currentTool === "circle" && (
                  <circle
                    cx={drawingStartPoint.x}
                    cy={drawingStartPoint.y}
                    r={Math.sqrt((tempDrawingEndCoord.x - drawingStartPoint.x) ** 2 + (tempDrawingEndCoord.y - drawingStartPoint.y) ** 2)}
                    fill="transparent"
                    stroke="rgba(79, 70, 229, 0.6)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={isDashed ? "6,6" : undefined}
                  />
                )}

                {/* DRAWN INTERACTIVE POINTS */}
                {points.map(pt => {
                  const isSelected = selectedElementId?.type === "point" && selectedElementId?.id === pt.id;
                  const isDraggingThis = draggedPointId === pt.id;
                  return (
                    <motion.g 
                      id={pt.id}
                      key={pt.id} 
                      onMouseDown={(e) => handlePointClick(e, pt)}
                      className="cursor-move group"
                    >
                      {/* Outer beautiful soft target ring */}
                      <motion.circle
                        animate={{
                          cx: pt.x,
                          cy: pt.y,
                          r: isSelected ? 8 : 6
                        }}
                        transition={
                          isDraggingThis
                            ? { type: "tween", duration: 0 }
                            : { type: "spring", stiffness: 150, damping: 20 }
                        }
                        fill="transparent"
                        stroke={isSelected ? "#818cf8" : "rgba(37, 99, 235, 0.15)"}
                        strokeWidth={2}
                        className="transition-all duration-150 group-hover:scale-125"
                      />
                      {/* Inner clean point anchor */}
                      <motion.circle
                        animate={{
                          cx: pt.x,
                          cy: pt.y,
                          r: isSelected ? 4.5 : 3.5
                        }}
                        transition={
                          isDraggingThis
                            ? { type: "tween", duration: 0 }
                            : { type: "spring", stiffness: 150, damping: 20 }
                        }
                        filter="url(#point-shadow)"
                        fill={isSelected ? "#4f46e5" : "white"}
                        stroke={isSelected ? "white" : "#2563eb"}
                        strokeWidth={1.8}
                      />
                      {/* Backing halo text for flawless readability over crossing vector lines */}
                      <motion.text
                        animate={{
                          x: pt.x + 8,
                          y: pt.y - 8
                        }}
                        transition={
                          isDraggingThis
                            ? { type: "tween", duration: 0 }
                            : { type: "spring", stiffness: 150, damping: 20 }
                        }
                        fontFamily="'Inter', sans-serif"
                        fontStyle="italic"
                        fontWeight="800"
                        fontSize="14px"
                        fill="white"
                        stroke="white"
                        strokeWidth={3}
                        strokeLinejoin="round"
                        className="select-none pointer-events-none opacity-80"
                      >
                        {pt.label}
                      </motion.text>
                      {/* Direct crisp text */}
                      <motion.text
                        animate={{
                          x: pt.x + 8,
                          y: pt.y - 8
                        }}
                        transition={
                          isDraggingThis
                            ? { type: "tween", duration: 0 }
                            : { type: "spring", stiffness: 150, damping: 20 }
                        }
                        fontFamily="'Inter', sans-serif"
                        fontStyle="italic"
                        fontWeight="800"
                        fontSize="14px"
                        fill="#1e293b"
                        className="select-none pointer-events-none"
                      >
                        {pt.label}
                      </motion.text>
                    </motion.g>
                  );
                })}

              </g>
            </svg>

            {/* ZOOM-PIN CONTROLS OVERLAY AND GRID POSITIONING info */}
            <div className="absolute bottom-4 left-4 bg-white/95 border border-[#e2e8f0] px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold text-[#475569] flex items-center gap-3.5 shadow-md pointer-events-none">
              <span>X: {mouseCoord.x}, Y: {mouseCoord.y}</span>
              <span className="w-px h-3 bg-zinc-200" />
              <span>Tỉ lệ: {Math.round(scale * 100)}%</span>
            </div>

            <div className="absolute top-4 right-4 flex gap-1.5">
              <button 
                id="btn-zoom-in"
                onClick={handleZoomIn} 
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-zinc-600 shadow-sm cursor-pointer"
                title="Phóng to"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                id="btn-zoom-out"
                onClick={handleZoomOut} 
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-zinc-600 shadow-sm cursor-pointer"
                title="Thu nhỏ"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                id="btn-reset-zoom"
                onClick={handleResetZoomPan} 
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-zinc-600 shadow-sm cursor-pointer"
                title="Khôi phục trạng thái"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button 
                id="btn-fullscreen-toggle"
                onClick={toggleFullscreen} 
                className="w-8 h-8 rounded-lg bg-white hover:bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-zinc-600 shadow-sm cursor-pointer"
                title={isFullscreen ? "Xem kèm lời giải" : "Xem toàn bộ hình"}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* AI LOADING WAITING OVERLAY */}
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#09090b]/85 backdrop-blur-sm flex flex-col justify-center items-center z-30"
                >
                  <div className="w-12 h-12 border-[3.5px] border-zinc-700 border-t-[#4f46e5] rounded-full animate-spin mb-4" />
                  <motion.div 
                    initial={{ y: 5 }}
                    animate={{ y: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                    className="text-sm font-semibold tracking-wide text-zinc-100"
                  >
                    AI Geometry Engine đang giải toán, dựng hình...
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* LỜI GIẢI CHI TIẾT VVIP AREA (AUTO HIDE IN FULLSCREEN) */}
          <div className={`${isFullscreen ? "hidden" : "flex-1"} flex flex-col bg-[#f8fafc] overflow-hidden`}>
            
            {/* PEDAGOGICAL TITLE BAR */}
            <div className="px-5 py-3 border-b border-[#e2e8f0] bg-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-xs font-extrabold tracking-wider uppercase text-[#4f46e5]">Lời giải chi tiết VVIP</span>
                
                {/* Horizontal dynamic sequence indicator */}
                <div className="flex gap-1.5">
                  {solutionSteps.map((_, i) => (
                    <span 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${i <= activeStepIndex ? "w-6 bg-[#4f46e5]" : "w-1.5 bg-[#e2e8f0]"}`} 
                    />
                  ))}
                </div>
              </div>

              <div className="text-[10px] font-extrabold px-3 py-1 bg-[#e0e7ff] text-[#4f46e5] rounded-md border border-[#c7d2fe] tracking-wider uppercase">
                PHONG CÁCH SƯ PHẠM CHUẨN MỰC
              </div>
            </div>

            {/* BENTO PEDAGOGICAL SPLIT */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* STEP ITEMS SELECTOR */}
              <div className="w-[30%] bg-white border-r border-[#e2e8f0] p-4 overflow-y-auto flex flex-col gap-2 shrink-0">
                {solutionSteps.map((step, i) => {
                  const isActive = i === activeStepIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveStepIndex(i)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                        isActive 
                        ? "bg-[#e0e7ff] border-[#c7d2fe] shadow-sm transform translate-x-1" 
                        : "bg-zinc-50/70 border-transparent hover:bg-zinc-100/60"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-all ${
                        isActive ? "bg-[#4f46e5] text-white shadow" : "bg-zinc-200 text-zinc-600"
                      }`}>
                        {i + 1}
                      </span>
                      <span className={`text-[11px] font-bold tracking-wide uppercase leading-tight mt-1 ${
                        isActive ? "text-[#4f46e5]" : "text-[#475569]"
                      }`}>
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ACTIVE SOLUTION STEP DETAILS */}
              <div className="flex-1 p-6 overflow-y-auto" id="export-solution-area">
                <AnimatePresence mode="wait">
                  {solutionSteps[activeStepIndex] && (
                    <motion.div
                      key={activeStepIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="max-w-3xl mx-auto bg-white border border-[#f1f5f9] rounded-2xl p-7 shadow-[0_4px_15px_rgba(0,0,0,0.02)]"
                    >
                      <div className="flex items-center gap-3.5 pb-4 mb-5 border-b-2 border-[#f1f5f9]">
                        <div className="w-10 h-10 rounded-full bg-[#e0e7ff] text-[#4f46e5] flex items-center justify-center">
                          <LucideType className="w-5 h-5 text-[#4f46e5]" />
                        </div>
                        <div>
                          <h4 className="text-[#0f172a] font-black text-lg uppercase leading-tight">
                            {solutionSteps[activeStepIndex].title.replace(/^\d+\.\s*/, "")}
                          </h4>
                          <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase mt-0.5">TƯ DUY TOÁN HỌC CHUẨN MỰC</p>
                        </div>
                      </div>

                      {/* Render text with math-expr properties */}
                      <div 
                        className="text-sm leading-relaxed text-[#334155] space-y-3.5"
                        dangerouslySetInnerHTML={{ __html: solutionSteps[activeStepIndex].content }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>

        </main>

        {/* RIGHT COLUMN: MANUAL DRAWING TOOLS SIDEBAR */}
        <aside className="w-[280px] bg-[#18181b] border-l border-[#3f3f46] flex flex-col shrink-0 print-hide z-10">
          <div className="px-5 py-3.5 text-xs font-bold tracking-widest text-[#e4e4e7] border-b border-[#3f3f46] uppercase shrink-0">
            CÔNG CỤ VẼ THỦ CÔNG
          </div>

          <div className="p-5 border-b border-[#3f3f46] flex flex-col gap-3 shrink-0">
            {/* Tool grid matching standard CAD utilities */}
            <div className="grid grid-cols-5 gap-2">
              <button
                id="btn-tool-select"
                onClick={() => setCurrentTool("select")}
                className={`aspect-square rounded-lg bg-[#27272a] border flex items-center justify-center transition duration-200 cursor-pointer ${
                  currentTool === "select" ? "bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg" : "border-[#3f3f46] text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
                title="Chọn & Di chuyển điểm (Phím tắt: V)"
              >
                <MousePointer className="w-4 h-4" />
              </button>

              <button
                id="btn-tool-point"
                onClick={() => setCurrentTool("point")}
                className={`aspect-square rounded-lg bg-[#27272a] border flex items-center justify-center transition duration-200 cursor-pointer ${
                  currentTool === "point" ? "bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg" : "border-[#3f3f46] text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
                title="Vẽ điểm (Phím tắt: P)"
              >
                <CircleDot className="w-4 h-4" />
              </button>

              <button
                id="btn-tool-line"
                onClick={() => setCurrentTool("line")}
                className={`aspect-square rounded-lg bg-[#27272a] border flex items-center justify-center transition duration-200 cursor-pointer ${
                  currentTool === "line" ? "bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg" : "border-[#3f3f46] text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
                title="Nối Đoạn thẳng (Phím tắt: L)"
              >
                <Slash className="w-4 h-4 rotate-45" />
              </button>

              <button
                id="btn-tool-circle"
                onClick={() => setCurrentTool("circle")}
                className={`aspect-square rounded-lg bg-[#27272a] border flex items-center justify-center transition duration-200 cursor-pointer ${
                  currentTool === "circle" ? "bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg" : "border-[#3f3f46] text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
                title="Vẽ đường tròn (Phím tắt: C)"
              >
                <Milestone className="w-4 h-4" />
              </button>

              <button
                id="btn-tool-eraser"
                onClick={() => setCurrentTool("eraser")}
                className={`aspect-square rounded-lg bg-[#27272a] border flex items-center justify-center transition duration-200 cursor-pointer ${
                  currentTool === "eraser" ? "bg-[#e11d48] border-[#e11d48] text-white shadow-lg" : "border-[#3f3f46] text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
                title="Tẩy xóa nét / Điểm (Phím tắt: E)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="flex gap-2">
              <button
                id="btn-undo-action"
                onClick={handleUndo}
                className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700/80 text-[#e4e4e7] text-xs font-bold cursor-pointer transition duration-150 border border-zinc-700"
                title="Phục hồi bước trước"
              >
                <Undo2 className="w-3.5 h-3.5 text-[#a855f7]" />
                QUAY LẠI
              </button>

              <button
                id="btn-clear-action"
                onClick={handleClearAll}
                className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/25 border border-red-900/50 text-[#f43f5e] text-xs font-bold cursor-pointer transition duration-150"
                title="Xóa trắng bảng vẽ"
              >
                <Trash2 className="w-3.5 h-3.5" />
                XÓA SẠCH
              </button>
            </div>
          </div>

          {/* GRID UTILITY PANEL */}
          <div className="p-5 border-b border-[#3f3f46] flex flex-col gap-3 shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Thiết lập Hệ thống</div>
            <div className="flex justify-between items-center bg-zinc-950/20 p-2 rounded-lg">
              <span className="text-xs text-zinc-300 font-medium">Hiển thị lưới tọa độ</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4f46e5]"></div>
              </label>
            </div>
          </div>

          {/* NET STYLING CONFIGURATION */}
          <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Cấu hình Đồ họa</div>
            
            {/* STROKE WIDTH */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs text-zinc-300">
                <span>Độ dày nét vẽ</span>
                <span className="font-bold text-[#818cf8]">{strokeWidth.toFixed(1)}px</span>
              </div>
              <input
                id="stroke-width-slider"
                type="range"
                className="w-full accent-[#4f46e5]"
                min="0.5"
                max="5.0"
                step="0.1"
                value={strokeWidth}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setStrokeWidth(val);
                  handleUpdateSelectedStroke(val, isDashed, strokeColor);
                }}
              />
            </div>

            {/* DASH LINE */}
            <div className="flex justify-between items-center bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-800/20">
              <span className="text-xs text-zinc-300 font-medium">Vẽ nét đứt (Ẩn/Khuất)</span>
              <label id="label-toggle-dash" className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isDashed}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsDashed(checked);
                    handleUpdateSelectedStroke(strokeWidth, checked, strokeColor);
                  }}
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4f46e5]"></div>
              </label>
            </div>

            {/* COLOR PALETTE PRESETS */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-300">Chọn màu sắc vẽ</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "var(--draw-blue)", display: "#2563eb" },
                  { value: "var(--draw-red)", display: "#ef4444" },
                  { value: "var(--draw-green)", display: "#10b981" },
                  { value: "var(--draw-orange)", display: "#f97316" },
                  { value: "var(--draw-purple)", display: "#8b5cf6" },
                  { value: "var(--draw-black)", display: "#0f172a" },
                  { value: "var(--draw-white)", display: "#ffffff" }
                ].map((col, idx) => {
                  const isActive = strokeColor === col.value;
                  return (
                    <button
                      key={idx}
                      className={`w-6.5 h-6.5 rounded-full border-2 cursor-pointer transition transform hover:scale-110 active:scale-95 ${
                        isActive ? "border-white shadow-[0_0_8px_white]" : "border-transparent"
                      }`}
                      style={{ backgroundColor: col.display }}
                      onClick={() => {
                        setStrokeColor(col.value);
                        handleUpdateSelectedStroke(strokeWidth, isDashed, col.value);
                      }}
                      title={col.value}
                    />
                  );
                })}
              </div>
            </div>

            {/* ELEMENT DETAIL STATS IF SELECTIVE */}
            {selectedElementId && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex flex-col gap-2"
              >
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-[#818cf8]">Yếu tố Đang chọn</div>
                <div className="text-xs text-zinc-300 flex justify-between">
                  <span>Loại hình:</span>
                  <span className="font-bold uppercase text-white">{selectedElementId.type}</span>
                </div>
                <div className="text-xs text-zinc-300 flex justify-between">
                  <span>ID:</span>
                  <span className="font-mono text-[10px] text-zinc-400">{selectedElementId.id}</span>
                </div>
                <button
                  id="btn-delete-selected"
                  onClick={handleDeleteSelected}
                  className="w-full py-1.5 mt-1 bg-red-600/20 hover:bg-red-600/30 border border-red-800 text-red-200 rounded text-xs font-bold transition duration-150 cursor-pointer"
                >
                  XÓA KHỎI BẢN VẼ
                </button>
              </motion.div>
            )}

          </div>
        </aside>

      </div>

    </div>
  );
}
