export interface Point {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface Line {
  id: string;
  p1: string; // point array id ref
  p2: string; // point array id ref
  dashed: boolean;
  color: string;
  width?: number;
}

export interface Circle {
  id: string;
  cx: number;
  cy: number;
  r: number;
  dashed: boolean;
  color: string;
  width?: number;
}

export interface FreePath {
  id: string;
  d: string;
  color: string;
  width: number;
  dashed: boolean;
}

export interface SolutionStep {
  title: string;
  content: string; // HTML format with class 'math-expr' styling
}

export interface SolvedResponse {
  title: string;
  extractedFacts: string[];
  points: Point[];
  lines: Omit<Line, "id">[];
  circles: Omit<Circle, "id">[];
  steps: SolutionStep[];
}
