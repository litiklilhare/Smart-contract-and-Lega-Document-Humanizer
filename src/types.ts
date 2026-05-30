export interface RedFlag {
  clause: string;
  issue_detected: string;
  why_it_is_bad: string;
}

export interface HighlightSegment {
  text: string;
  risk: 'safe' | 'caution' | 'danger' | 'none';
  explanation?: string;
}

export interface AnalysisResult {
  summary: string[];
  status: 'Legal' | 'Illegal' | 'High-Risk Suspicious';
  compliance_score: number;
  red_flags: RedFlag[];
  segments: HighlightSegment[];
  metadata?: {
    documentName?: string;
    documentType?: string;
    wordCount?: number;
    charCount?: number;
    detectedLanguage?: string;
  };
}

export interface HistoryItem {
  id: string;
  name: string;
  timestamp: string;
  status: 'Legal' | 'Illegal' | 'High-Risk Suspicious';
  compliance_score: number;
  result: AnalysisResult;
}
