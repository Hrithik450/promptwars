import { PatternDefinition } from "../types/pattern.detector.types";

/**
 * Curated regex patterns for fast deterministic threat detection (Layer 1A).
 * Categorized into 7 distinct security threat vectors with assigned severity ratings (0.0 - 1.0).
 */
export const PATTERN_DEFINITIONS: PatternDefinition[] = [
  // ==========================================
  // 1. SYSTEM PROMPT OVERRIDE (PROMPT_INJECTION)
  // ==========================================
  {
    id: "SYS_OVERRIDE_01",
    category: "PROMPT_INJECTION",
    pattern: /\bignore\s+(all\s+)?(previous|prior|above|existing|system)\s+(instructions|rules|prompts|directions|commands|constraints)\b/i,
    severity: 0.95,
    description: "Direct instruction to ignore prior system instructions or prompts.",
  },
  {
    id: "SYS_OVERRIDE_02",
    category: "PROMPT_INJECTION",
    pattern: /\bforget\s+(all\s+)?(your|previous|prior|existing)\s+(instructions|training|rules|prompts|guidelines)\b/i,
    severity: 0.95,
    description: "Command to forget core rules or training.",
  },
  {
    id: "SYS_OVERRIDE_03",
    category: "PROMPT_INJECTION",
    pattern: /\bdisregard\s+(all\s+)?(previous|prior|above|system)\s+(instructions|rules|prompts|limits)\b/i,
    severity: 0.95,
    description: "Directive to disregard existing security prompts or rules.",
  },
  {
    id: "SYS_OVERRIDE_04",
    category: "PROMPT_INJECTION",
    pattern: /\byou\s+are\s+now\s+(in|a|an)?\s*(maintenance|developer|debug|admin|unrestricted|god)\s+mode\b/i,
    severity: 0.9,
    description: "Attempt to trigger privileged maintenance or developer mode.",
  },
  {
    id: "SYS_OVERRIDE_05",
    category: "PROMPT_INJECTION",
    pattern: /\bnew\s+instructions\s*:/i,
    severity: 0.85,
    description: "Injection prefix specifying new unauthorized instructions.",
  },
  {
    id: "SYS_OVERRIDE_06",
    category: "PROMPT_INJECTION",
    pattern: /(^|\n)\s*(system\s*:|\[SYSTEM\]|<\|system\|>|###\s*system)/i,
    severity: 0.95,
    description: "Spoofed system role header attempting prompt injection.",
  },

  // ==========================================
  // 2. ROLEPLAY / PERSONA HIJACK (JAILBREAK_ROLEPLAY)
  // ==========================================
  {
    id: "ROLEPLAY_01",
    category: "JAILBREAK_ROLEPLAY",
    pattern: /\bpretend\s+(you\s+are|to\s+be)\b/i,
    severity: 0.85,
    description: "Roleplay prompt attempting to hijack model identity.",
  },
  {
    id: "ROLEPLAY_02",
    category: "JAILBREAK_ROLEPLAY",
    pattern: /\b(act|roleplay|behave)\s+as\s+(a|an)?\b/i,
    severity: 0.8,
    description: "Instruction to act or roleplay as another entity.",
  },
  {
    id: "ROLEPLAY_03",
    category: "JAILBREAK_ROLEPLAY",
    pattern: /\b(you\s+are|become)\s+(a\s+)?(DAN|Do\s+Anything\s+Now)\b/i,
    severity: 0.98,
    description: "Classic DAN (Do Anything Now) jailbreak attempt.",
  },
  {
    id: "ROLEPLAY_04",
    category: "JAILBREAK_ROLEPLAY",
    pattern: /\b(jailbreak|unrestricted\s+mode|unfiltered\s+mode)\b/i,
    severity: 0.9,
    description: "Explicit mention of jailbreak or unfiltered mode.",
  },
  {
    id: "ROLEPLAY_05",
    category: "JAILBREAK_ROLEPLAY",
    pattern: /\bwith(out|\s+no)\s+(any\s+)?(security|rules|restrictions|limits|safety|checks)\b/i,
    severity: 0.9,
    description: "Attempt to disable safety limits and security checks through roleplay.",
  },
  {
    id: "ROLEPLAY_06",
    category: "JAILBREAK_ROLEPLAY",
    pattern: /\blet'?s\s+play\s+a\s+game\b.*?\b(always\s+says?\s+yes|no\s+rules|transfer)\b/i,
    severity: 0.85,
    description: "Game simulation framing designed to force permissive compliance.",
  },
  {
    id: "ROLEPLAY_07",
    category: "JAILBREAK_ROLEPLAY",
    pattern: /\b(imagine|assume)\s+you\s+are\s+(a|an)?\b/i,
    severity: 0.75,
    description: "Hypothetical scenario injection.",
  },

  // ==========================================
  // 3. INSTRUCTION SMUGGLING (INSTRUCTION_OVERRIDE)
  // ==========================================
  {
    id: "SMUGGLE_01",
    category: "INSTRUCTION_OVERRIDE",
    pattern: /\bignore\s+the\s+above\s+and\b/i,
    severity: 0.9,
    description: "Instruction smuggling pivot phrase to supersede preceding text.",
  },
  {
    id: "SMUGGLE_02",
    category: "INSTRUCTION_OVERRIDE",
    pattern: /\binstead\s+(do|transfer|execute|send|show|give|output)\b/i,
    severity: 0.75,
    description: "Instruction diversion attempting to redirect planned action.",
  },
  {
    id: "SMUGGLE_03",
    category: "INSTRUCTION_OVERRIDE",
    pattern: /\bactually,?\s+(do|just|please|override|bypass)\b/i,
    severity: 0.7,
    description: "Mid-prompt command redirection.",
  },
  {
    id: "SMUGGLE_04",
    category: "INSTRUCTION_OVERRIDE",
    pattern: /\b(override|bypass|skip|ignore)\s+(all\s+)?(validation|security|checks|verification|rules|limits)\b/i,
    severity: 0.95,
    description: "Direct request to bypass or ignore validation, security, or transaction limits.",
  },
  {
    id: "SMUGGLE_05",
    category: "INSTRUCTION_OVERRIDE",
    pattern: /\bpre-?approved\s+and\s+(do\s+not|don't)\s+need\s+checking\b/i,
    severity: 0.85,
    description: "Deceptive claim that transfers are pre-approved without verification.",
  },
  {
    id: "SMUGGLE_06",
    category: "INSTRUCTION_OVERRIDE",
    pattern: /\bdisable\s+(memo\s+scanning|security|validation|verification|checks)\b/i,
    severity: 0.95,
    description: "Direct command to disable internal security components like memo scanning.",
  },

  // ==========================================
  // 4. DATA EXFILTRATION PROBES (DATA_EXFIL)
  // ==========================================
  {
    id: "EXFIL_01",
    category: "DATA_EXFIL",
    pattern: /\bshow\s+(me\s+)?(all\s+)?([a-z]+\s+)?(accounts|users|passwords|system|config|database|keys|tokens|secrets|tables|credentials|balances)\b/i,
    severity: 0.9,
    description: "Probe attempting to extract sensitive accounts, passwords, or system configurations.",
  },
  {
    id: "EXFIL_02",
    category: "DATA_EXFIL",
    pattern: /\blist\s+all\s+([a-z]+\s+)?(users|accounts|tables|customers|records|passwords|keys|databases)\b/i,
    severity: 0.9,
    description: "Exfiltration enumeration query targeting users or tables.",
  },
  {
    id: "EXFIL_03",
    category: "DATA_EXFIL",
    pattern: /\b(dump|export\s+all)\s+(database|memory|system|accounts|users|records|tables)\b/i,
    severity: 0.95,
    description: "Data dump command targeting internal databases or tables.",
  },
  {
    id: "EXFIL_04",
    category: "DATA_EXFIL",
    pattern: /\breveal\s+(your\s+)?(system|internal|secret|prompt|configuration|api\s*keys|database)\b/i,
    severity: 0.9,
    description: "Request to reveal internal system keys or prompts.",
  },
  {
    id: "EXFIL_05",
    category: "DATA_EXFIL",
    pattern: /\bwhat\s+is\s+your\s+(system\s+prompt|prompt|system\s+message|instructions|hidden\s+prompt|configuration)\b/i,
    severity: 0.95,
    description: "Direct interrogation probing the system prompt or hidden instructions.",
  },
  {
    id: "EXFIL_06",
    category: "DATA_EXFIL",
    pattern: /\brepeat\s+(the\s+above|your\s+instructions|the\s+system\s+prompt|everything\s+before)\b/i,
    severity: 0.9,
    description: "System prompt echoing / leaking probe.",
  },
  {
    id: "EXFIL_07",
    category: "DATA_EXFIL",
    pattern: /\bZEBRA-7742\b/i,
    severity: 1.0,
    description: "Canary token honeypot leak detection (ZEBRA-7742).",
  },

  // ==========================================
  // 5. CODE / COMMAND INJECTION (CODE_INJECTION)
  // ==========================================
  {
    id: "CODE_INJ_01",
    category: "CODE_INJECTION",
    pattern: /\b(eval|exec)\s*\(/i,
    severity: 0.95,
    description: "Attempted execution of eval or exec script functions.",
  },
  {
    id: "CODE_INJ_02",
    category: "CODE_INJECTION",
    pattern: /\b(import\s+os|subprocess|require\(|process\.env)\b/i,
    severity: 0.95,
    description: "Embedded system-level code or process environment access.",
  },
  {
    id: "CODE_INJ_03",
    category: "CODE_INJECTION",
    pattern: /(;\s*DROP\s+TABLE\b|\bSELECT\s+\*\s+FROM\b|\bUNION\s+SELECT\b|'\s*OR\s*'1'\s*=\s*'1|';\s*--)/i,
    severity: 0.95,
    description: "SQL injection payload embedded in query or memo.",
  },
  {
    id: "CODE_INJ_04",
    category: "CODE_INJECTION",
    pattern: /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/i,
    severity: 0.95,
    description: "Embedded cross-site scripting (XSS) HTML/JavaScript script tag.",
  },
  {
    id: "CODE_INJ_05",
    category: "CODE_INJECTION",
    pattern: /<\s*script\b/i,
    severity: 0.9,
    description: "Opening script tag indicative of XSS attempt.",
  },
  {
    id: "CODE_INJ_06",
    category: "CODE_INJECTION",
    pattern: /(\{\{.*?system.*?\}\}|\$\{.*?\}|`[^`]+`)/i,
    severity: 0.9,
    description: "Template injection or shell backtick command substitution syntax.",
  },

  // ==========================================
  // 6. SEPARATOR / CONTEXT-BREAK (CONTEXT_BREAK)
  // ==========================================
  {
    id: "BREAK_01",
    category: "CONTEXT_BREAK",
    pattern: /(---|===|\*\*\*){3,}/,
    severity: 0.8,
    description: "Multiple visual delimiter separators designed to simulate prompt boundaries.",
  },
  {
    id: "BREAK_02",
    category: "CONTEXT_BREAK",
    pattern: /\b(END\s+OF\s+PROMPT|BEGIN\s+NEW\s+CONVERSATION|ADMIN\s+MODE|\[RESET\])\b/i,
    severity: 0.85,
    description: "Explicit simulated conversational reset or boundary token.",
  },
  {
    id: "BREAK_03",
    category: "CONTEXT_BREAK",
    pattern: /(<\|endoftext\|>|<\|im_end\|>|<\|im_start\|>|\[INST\]|\[\/INST\])/i,
    severity: 0.95,
    description: "Special LLM delimiter tokens used for tokenizer boundary hijacking.",
  },
  {
    id: "BREAK_04",
    category: "CONTEXT_BREAK",
    pattern: /###\s*(Instruction|Response|System)/i,
    severity: 0.85,
    description: "Alpaca-style instruction block header smuggling.",
  },

  // ==========================================
  // 7. SOCIAL ENGINEERING (SOCIAL_ENGINEERING)
  // ==========================================
  {
    id: "SOC_ENG_01",
    category: "SOCIAL_ENGINEERING",
    pattern: /\b(emergency\s+override|urgent\s+override)\b/i,
    severity: 0.85,
    description: "Urgent/emergency override pressure designed to bypass verification.",
  },
  {
    id: "SOC_ENG_02",
    category: "SOCIAL_ENGINEERING",
    pattern: /\b(I\s+am\s+(the\s+)?(bank\s+manager|admin|compliance\s+department|compliance\s+officer|CEO))\b/i,
    severity: 0.85,
    description: "False authority impersonation claiming executive or managerial credentials.",
  },
  {
    id: "SOC_ENG_03",
    category: "SOCIAL_ENGINEERING",
    pattern: /\b(CEO|manager|compliance|compliance\s+department)\s+(authorized|says|ordered|requires)\b.*?\b(transfer|send|bypass|skip)\b/i,
    severity: 0.85,
    description: "Appeals to executive authorization to justify immediate fund release.",
  },
  {
    id: "SOC_ENG_04",
    category: "SOCIAL_ENGINEERING",
    pattern: /\bskip\s+all\s+checks\b/i,
    severity: 0.9,
    description: "Coercive instruction demanding security checks be omitted.",
  },
  {
    id: "SOC_ENG_05",
    category: "SOCIAL_ENGINEERING",
    pattern: /\b(executive\s+bonus|emergency\s+fund)\b.*?\b(now|immediately)\b/i,
    severity: 0.75,
    description: "Suspicious pretext transfer with high urgency marker.",
  },

  // ==========================================
  // 8. MULTI-LANGUAGE INJECTIONS (PROMPT_INJECTION)
  // ==========================================
  {
    id: "MULTI_ES_01",
    category: "PROMPT_INJECTION",
    pattern: /\b(ignora|olvida|desestima)\s+(todas?\s+las?\s+)?(instrucciones|reglas|indicaciones)\b/i,
    severity: 0.95,
    description: "Spanish prompt injection: directive to ignore instructions or rules.",
  },
  {
    id: "MULTI_ES_02",
    category: "JAILBREAK_ROLEPLAY",
    pattern: /\b(modo\s+desarrollador|sin\s+(seguridad|restricciones)|finge\s+que\s+eres)\b/i,
    severity: 0.9,
    description: "Spanish jailbreak / developer mode roleplay.",
  },
  {
    id: "MULTI_HI_01",
    category: "PROMPT_INJECTION",
    pattern: /\b(pichle|purane)\s+(sabhi\s+)?(nirdesh|niyam|instructions)\s+(bhool\s+jao|ignore\s+karo)\b/i,
    severity: 0.95,
    description: "Hindi/Hinglish prompt injection: forget prior rules/instructions.",
  },
  {
    id: "MULTI_HI_02",
    category: "PROMPT_INJECTION",
    pattern: /(पिछले\s+सभी\s+निर्देश\s+भूल\s+जाओ|सारे\s+नियम\s+(तोड़\s+दो|भूल\s+जाओ))/i,
    severity: 0.95,
    description: "Devanagari script prompt injection override.",
  },
  {
    id: "MULTI_ZH_01",
    category: "PROMPT_INJECTION",
    pattern: /(忽略|无视|忘记).*?(指令|规则|提示词)/i,
    severity: 0.95,
    description: "Mandarin Chinese prompt injection: ignore system instructions.",
  },
  {
    id: "MULTI_ZH_02",
    category: "JAILBREAK_ROLEPLAY",
    pattern: /(假装你是|开发者模式|越狱模式|没有任何安全限制)/i,
    severity: 0.9,
    description: "Mandarin Chinese jailbreak / roleplay bypass.",
  },
  {
    id: "MULTI_FR_01",
    category: "PROMPT_INJECTION",
    pattern: /\b(ignore|oublie)\s+(toutes\s+les\s+)?(instructions|règles)\b/i,
    severity: 0.95,
    description: "French prompt injection: ignore instructions/rules.",
  },
  {
    id: "MULTI_RU_01",
    category: "PROMPT_INJECTION",
    pattern: /(игнорируй|забудь)\s+(все\s+)?(предыдущие\s+)?(инструкции|правила)/i,
    severity: 0.95,
    description: "Russian prompt injection: ignore all previous instructions.",
  },
];
