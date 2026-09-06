'use client';

import React from 'react';
import { Check, X, AlertTriangle, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight, robust Markdown Renderer for AI Custom Prompt Responses & Financial Tables
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split into lines for block-level parsing
  const rawLines = content.split(/\r?\n/);

  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let isInsideTable = false;

  const flushTable = (key: number) => {
    if (tableRows.length === 0) return null;

    const [headerRow, separatorRow, ...dataRows] = tableRows;
    const cleanHeader = headerRow.map((c) => c.trim()).filter((c) => c.length > 0);
    const validDataRows = (dataRows.length > 0 ? dataRows : (separatorRow && !separatorRow.every(c => c.includes('---')) ? [separatorRow] : []))
      .map((row) => row.map((c) => c.trim()).filter((c) => c.length > 0));

    tableRows = [];
    isInsideTable = false;

    return (
      <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          {cleanHeader.length > 0 && (
            <thead className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                {cleanHeader.map((h, i) => (
                  <th key={i} className="p-3 whitespace-nowrap">
                    {renderInlineFormatting(h)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300">
            {validDataRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                {row.map((cell, cIdx) => {
                  const isNumberOrCurrency = cell.includes('₹') || cell.includes('%') || !isNaN(Number(cell.replace(/[,₹%]/g, '')));
                  return (
                    <td key={cIdx} className={`p-3 text-xs ${isNumberOrCurrency ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                      {renderInlineFormatting(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    // Table line detection: starts and contains pipes
    if (line.startsWith('|') && line.includes('|')) {
      isInsideTable = true;
      const cells = line.split('|').slice(1, -1);
      // Skip separator lines like |---|---|
      if (cells.every((c) => c.trim().match(/^[-:]+$/))) {
        continue;
      }
      tableRows.push(cells);
      continue;
    } else if (isInsideTable) {
      // Flush previous table
      elements.push(flushTable(i));
    }

    if (!line) {
      elements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Heading 1 (# ...)
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-black text-slate-900 dark:text-white mt-6 mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="w-2 h-5 rounded-full bg-purple-600" />
          <span>{renderInlineFormatting(line.replace(/^#\s+/, ''))}</span>
        </h1>
      );
      continue;
    }

    // Heading 2 (## ...)
    if (line.startsWith('## ')) {
      const headingText = line.replace(/^##\s+/, '');
      elements.push(
        <h2 key={`h2-${i}`} className="text-base font-extrabold text-slate-900 dark:text-white mt-5 mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-indigo-500" />
          <span>{renderInlineFormatting(headingText)}</span>
        </h2>
      );
      continue;
    }

    // Heading 3 (### ...)
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2 flex items-center gap-1.5">
          <span>{renderInlineFormatting(line.replace(/^###\s+/, ''))}</span>
        </h3>
      );
      continue;
    }

    // Blockquote (> ...)
    if (line.startsWith('>')) {
      elements.push(
        <div key={`quote-${i}`} className="my-2 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border-l-4 border-indigo-500 text-xs text-slate-700 dark:text-slate-200 font-medium">
          {renderInlineFormatting(line.replace(/^>\s*/, ''))}
        </div>
      );
      continue;
    }

    // Unordered List (- item or * item)
    if (line.match(/^[-*]\s+/)) {
      const listContent = line.replace(/^[-*]\s+/, '');
      const isCheck = listContent.startsWith('✅');
      const isCross = listContent.startsWith('❌');
      const isAlert = listContent.startsWith('⚠️') || listContent.startsWith('⚡');

      elements.push(
        <div key={`list-${i}`} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 my-1 pl-1">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">•</span>
          <div className={`flex-1 leading-relaxed ${isCheck ? 'font-semibold text-emerald-700 dark:text-emerald-300' : isCross ? 'font-semibold text-rose-700 dark:text-rose-300' : ''}`}>
            {renderInlineFormatting(listContent)}
          </div>
        </div>
      );
      continue;
    }

    // Numbered List (1. item)
    if (line.match(/^\d+\.\s+/)) {
      const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numberMatch) {
        elements.push(
          <div key={`numlist-${i}`} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 my-1 pl-1">
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center mt-0.5">
              {numberMatch[1]}
            </span>
            <div className="flex-1 leading-relaxed">
              {renderInlineFormatting(numberMatch[2])}
            </div>
          </div>
        );
        continue;
      }
    }

    // Standard Paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-1.5">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  if (isInsideTable) {
    elements.push(flushTable(rawLines.length));
  }

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};

/**
 * Handles inline bold (**text**), code (`code`), and highlighted badges
 */
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return '';

  // Regex to split on bold **...** and backticks `...`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-extrabold text-slate-900 dark:text-white">
          {boldText}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code key={index} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
          {codeText}
        </code>
      );
    }
    return part;
  });
}
