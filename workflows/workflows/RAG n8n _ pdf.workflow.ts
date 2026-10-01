const recursive_Character_Text_Splitter = textSplitter({ type: '@n8n/n8n-nodes-langchain.textSplitterRecursiveCharacterTextSplitter', version: 1, config: { name: 'Recursive Character Text Splitter', parameters: { chunkOverlap: 200, options: {} }, position: [-128, 720] } });
const google_Gemini_Chat_Model = languageModel({ type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini', version: 1.2, config: { name: 'Google Gemini Chat Model', parameters: { modelName: 'models/gemini-flash-lite-latest', options: { temperature: 0.2 } }, credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account 2', 'Rt1fE6j0sjYJDDch') }, position: [1936, 1424], retryOnFail: true, maxTries: 3, waitBetweenTries: 5000 } });
const postgres_Chat_Memory = memory({ type: '@n8n/n8n-nodes-langchain.memoryPostgresChat', version: 1.3, config: { name: 'Postgres Chat Memory', parameters: { contextWindowLength: 10 }, credentials: { postgres: newCredential('Postgres account', 'SYGCGSwWZ2h75qim') }, position: [944, 880] } });
const google_Gemini_Embeddings = embedding({ type: '@n8n/n8n-nodes-langchain.embeddingsGoogleGemini', version: 1, config: { name: 'Google Gemini Embeddings', parameters: { modelName: 'models/gemini-embedding-2' }, credentials: { googlePalmApi: newCredential('Google Gemini(PaLM) Api account 2', 'Rt1fE6j0sjYJDDch') }, position: [288, 528] } });
const knowledge_Base = tool({ type: '@n8n/n8n-nodes-langchain.vectorStoreSupabase', version: 1.3, config: { name: 'Knowledge Base', parameters: { mode: 'retrieve-as-tool', toolDescription: 'Searches passages from the PDF documents uploaded to the knowledge base. Use it for any question about the content of these documents.', tableName: { __rl: true, mode: 'id', value: 'documents' }, options: { queryName: 'match_documents' } }, credentials: { supabaseApi: newCredential('Supabase account', 'G1PAkkKia2WvHk9Q') }, position: [784, 384], subnodes: { embedding: google_Gemini_Embeddings } } });
const default_Data_Loader = documentLoader({ type: '@n8n/n8n-nodes-langchain.documentDefaultDataLoader', version: 1.1, config: { name: 'Default Data Loader', parameters: { jsonMode: 'expressionData', jsonData: expr('{{ $json.text }}'), textSplittingMode: 'custom', options: { metadata: { metadataValues: [{ name: 'source', value: expr('{{ $json.source }}') }, { name: 'part', value: expr('{{ $json.part }}') }] } } }, position: [288, 720], subnodes: { textSplitter: recursive_Character_Text_Splitter } } });
const routing_Output_Parser = outputParser({ type: '@n8n/n8n-nodes-langchain.outputParserStructured', version: 1.3, config: { name: 'Routing Output Parser', parameters: { jsonSchemaExample: '{\n  "query": "What are the main risks described in the report?",\n  "keywords": ["risks", "main risks", "report"],\n  "language": "English"\n}' }, position: [1568, 1424] } });
const reranking_Output_Parser = outputParser({ type: '@n8n/n8n-nodes-langchain.outputParserStructured', version: 1.3, config: { name: 'Reranking Output Parser', parameters: { jsonSchemaExample: '{\n  "selected": [0, 3, 5, 7]\n}' }, position: [2320, 1424] } });

const on_form_submission = trigger({
  type: 'n8n-nodes-base.formTrigger',
  version: 2.6,
  config: { name: 'On form submission', parameters: { formTitle: 'RAG - Upload a PDF', formDescription: 'Upload a PDF with selectable text. It is split, embedded and added to the knowledge base. Uploading a file with the same name replaces its previous version.', formFields: { values: [{ fieldLabel: 'PDF', fieldType: 'file', multipleFiles: false, acceptFileTypes: '.pdf', requiredField: true }] }, options: {} }, position: [64, -160] }
});

const extract_from_File = node({
  type: 'n8n-nodes-base.extractFromFile',
  version: 1,
  config: { name: 'Extract from File', parameters: { operation: 'pdf', binaryPropertyName: expr('{{ Object.keys($binary)[0] }}'), options: {} }, position: [240, -160] }
});

const delete_Previous_Version = node({
  type: 'n8n-nodes-base.postgres',
  version: 2.7,
  config: { name: 'Delete Previous Version', parameters: { operation: 'executeQuery', query: 'DELETE FROM documents WHERE metadata->>\'source\' = ($1::jsonb)->>\'source\';', options: { queryReplacement: expr('{{ JSON.stringify({ source: Object.values($(\'On form submission\').first().binary)[0].fileName }) }}') } }, credentials: { postgres: newCredential('Postgres account', 'SYGCGSwWZ2h75qim') }, position: [336, -16] }
});

const split_Text_Into_Segments = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Split Text Into Segments', parameters: { jsCode: 'const text = $(\'Extract from File\').first().json.text || \'\';\nif (!text.trim()) {\n  throw new Error(\'No text could be extracted from this PDF. Scanned PDFs without a text layer are not supported.\');\n}\nconst binary = $(\'On form submission\').first().binary || {};\nconst source = (Object.values(binary)[0] || {}).fileName || \'document.pdf\';\nconst segmentSize = 16000;\nconst segmentCount = Math.max(1, Math.ceil(text.length / segmentSize));\nconst target = text.length / segmentCount;\nconst cuts = [0];\nfor (let i = 1; i < segmentCount; i++) {\n  const ideal = Math.round(i * target);\n  const previous = cuts[cuts.length - 1];\n  const newline = text.lastIndexOf(\'\\n\', ideal);\n  cuts.push(newline > previous && ideal - newline < target / 4 ? newline : Math.max(ideal, previous + 1));\n}\ncuts.push(text.length);\nconst segments = [];\nfor (let i = 0; i < segmentCount; i++) {\n  segments.push(text.slice(cuts[i], cuts[i + 1]));\n}\nreturn segments.map((segment, index) => ({ json: { text: segment, source, part: index + 1, parts: segments.length } }));' }, position: [432, -160], notes: 'Splits the extracted book text into segments of about 40000 characters so each loop iteration stays under the Gemini embedding rate limit.' }
});

const loop_Over_Items = node({
  type: 'n8n-nodes-base.splitInBatches',
  version: 3,
  config: { name: 'Loop Over Items', parameters: { options: {} }, position: [608, -160] }
});

const supabase_Vector_Store = node({
  type: '@n8n/n8n-nodes-langchain.vectorStoreSupabase',
  version: 1.3,
  config: { name: 'Supabase Vector Store', parameters: { mode: 'insert', tableName: { __rl: true, mode: 'id', value: 'documents' }, embeddingBatchSize: 100, options: { queryName: 'match_documents' } }, credentials: { supabaseApi: newCredential('Supabase account', 'G1PAkkKia2WvHk9Q') }, position: [832, -160], retryOnFail: true, maxTries: 5, waitBetweenTries: 5000, subnodes: { embedding: google_Gemini_Embeddings, documentLoader: default_Data_Loader } }
});

const wait = node({
  type: 'n8n-nodes-base.wait',
  version: 1.1,
  config: { name: 'Wait', parameters: { amount: 25 }, position: [1216, -128] }
});

const when_chat_message_received = trigger({
  type: '@n8n/n8n-nodes-langchain.chatTrigger',
  version: 1.5,
  config: { name: 'When chat message received', parameters: { options: {} }, position: [656, 1360] }
});

const inputs = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Inputs', parameters: { assignments: { assignments: [{ id: 'a1', name: 'chatInput', type: 'string', value: expr('{{ $json.chatInput }}') }, { id: 'a2', name: 'sessionId', type: 'string', value: expr('{{ $json.sessionId }}') }, { id: 'a3', name: 'topK', type: 'number', value: 10 }, { id: 'a4', name: 'keep', type: 'number', value: 4 }] }, options: {} }, position: [880, 1200] }
});

const get_Session_Messages = node({
  type: 'n8n-nodes-base.postgres',
  version: 2.7,
  config: { name: 'Get Session Messages', parameters: { operation: 'executeQuery', query: 'SELECT COUNT(*)::int AS count,\n  COALESCE(string_agg((CASE WHEN m.message->>\'type\' = \'human\' THEN \'User: \' ELSE \'Assistant: \' END) || left(m.message->>\'content\', 600), E\'\\n\' ORDER BY m.id), \'\') AS history\nFROM (SELECT id, message FROM n8n_chat_histories WHERE session_id = $1 ORDER BY id DESC LIMIT 10) m;', options: { queryReplacement: expr('{{ $json.sessionId }}') } }, credentials: { postgres: newCredential('Postgres account', 'SYGCGSwWZ2h75qim') }, position: [1088, 1200] }
});

const empty_Conversation = node({
  type: 'n8n-nodes-base.if',
  version: 2.3,
  config: { name: 'Empty Conversation', parameters: { conditions: { combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 }, conditions: [{ id: 'c1', leftValue: expr('{{ $json.count }}'), rightValue: 0, operator: { type: 'number', operation: 'equals' } }] }, options: {} }, position: [1280, 1200] }
});

const routing = node({
  type: '@n8n/n8n-nodes-langchain.chainLlm',
  version: 1.9,
  config: { name: 'Routing', parameters: { promptType: 'define', text: expr('Conversation history (may be empty):\n{{ $(\'Get Session Messages\').first().json.history }}\n\nLatest user question:\n{{ $(\'Inputs\').first().json.chatInput }}'), hasOutputParser: true, messages: { messageValues: [{ message: 'You prepare search queries for a retrieval system over a knowledge base of documents uploaded by the user. Rewrite the latest user question as one standalone search query, using the conversation history to resolve references such as pronouns or follow-up questions. Write the query in the same language as the latest user question. Also give 3 to 6 keywords that should appear in relevant passages, and the English name of the language in which the latest user question is written. Do not answer the question.' }] }, batching: {} }, position: [1504, 1200], retryOnFail: true, maxTries: 3, waitBetweenTries: 5000, subnodes: { model: google_Gemini_Chat_Model, outputParser: routing_Output_Parser } }
});

const search = node({
  type: '@n8n/n8n-nodes-langchain.vectorStoreSupabase',
  version: 1.3,
  config: { name: 'Search', parameters: { mode: 'load', tableName: { __rl: true, mode: 'id', value: 'documents' }, prompt: expr('{{ $json.output.query }} {{ ($json.output.keywords || []).join(\' \') }}'), topK: expr('{{ $(\'Inputs\').first().json.topK }}'), options: { queryName: 'match_documents' } }, credentials: { supabaseApi: newCredential('Supabase account', 'G1PAkkKia2WvHk9Q') }, position: [1824, 1200], alwaysOutputData: true, subnodes: { embedding: google_Gemini_Embeddings } }
});

const aggregate_Results = node({
  type: 'n8n-nodes-base.aggregate',
  version: 1,
  config: { name: 'Aggregate Results', parameters: { aggregate: 'aggregateAllItemData', destinationFieldName: 'results', options: {} }, position: [2064, 1200] }
});

const has_Results = node({
  type: 'n8n-nodes-base.if',
  version: 2.3,
  config: { name: 'Has Results', parameters: { conditions: { combinator: 'and', options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 }, conditions: [{ id: 'h1', leftValue: expr('{{ ($json.results || []).filter(r => r.document).length }}'), rightValue: 0, operator: { type: 'number', operation: 'gt' } }] }, options: {} }, position: [2176, 1360] }
});

const reranking = node({
  type: '@n8n/n8n-nodes-langchain.chainLlm',
  version: 1.9,
  config: { name: 'Reranking', parameters: { promptType: 'define', text: expr('Question: {{ $(\'Routing\').first().json.output.query }}\n\nPassages:\n{{ $json.results.map((r, i) => \'[\' + i + \'] \' + r.document.pageContent).join(\'\\n\\n\') }}'), hasOutputParser: true, messages: { messageValues: [{ message: 'You are a reranker for a retrieval system. From the numbered passages, select the passages that are most useful to answer the question, ordered from most to least relevant. Return only their numbers. Select at most 4 passages and never invent a number that is not in the list.' }] }, batching: {} }, position: [2272, 1200], retryOnFail: true, maxTries: 3, waitBetweenTries: 5000, subnodes: { model: google_Gemini_Chat_Model, outputParser: reranking_Output_Parser } }
});

const select_Passages = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Select Passages', parameters: { assignments: { assignments: [{ id: 's1', name: 'context', type: 'string', value: expr('{{ [...new Set(($json.output.selected || []).concat([0, 1, 2, 3]))].filter(i => $(\'Aggregate Results\').first().json.results[i]).slice(0, $(\'Inputs\').first().json.keep).map(i => \'[Source: \' + (($(\'Aggregate Results\').first().json.results[i].document.metadata || {}).source || \'unknown\') + \']\\n\' + $(\'Aggregate Results\').first().json.results[i].document.pageContent).join(\'\\n\\n---\\n\\n\') }}') }] }, options: {} }, position: [2560, 1200] }
});

const generation = node({
  type: '@n8n/n8n-nodes-langchain.chainLlm',
  version: 1.9,
  config: { name: 'Generation', parameters: { promptType: 'define', text: expr('Conversation history (may be empty):\n{{ $(\'Get Session Messages\').first().json.history }}\n\nPassages from the knowledge base:\n{{ $json.context || \'No passage was found in the knowledge base.\' }}\n\nQuestion: {{ $(\'Inputs\').first().json.chatInput }}\n\nWrite your answer in {{ $(\'Routing\').first().json.output.language || \'the language of the question\' }}.'), messages: { messageValues: [{ message: 'You answer questions using only the passages provided from the user\'s documents. Write the answer in the language requested at the end of the user message. Start with a short, direct answer, then add details if useful. When relevant, quote briefly the passage that supports your answer, in its original language, and name the source document given in its Source label. If the passages do not contain the answer, say clearly that the indexed documents do not allow you to answer, and do not invent anything.' }] }, batching: {} }, position: [2768, 1200], retryOnFail: true, maxTries: 3, waitBetweenTries: 5000, subnodes: { model: google_Gemini_Chat_Model } }
});

const save_Messages = node({
  type: 'n8n-nodes-base.postgres',
  version: 2.7,
  config: { name: 'Save Messages', parameters: { operation: 'executeQuery', query: 'INSERT INTO n8n_chat_histories (session_id, message)\nSELECT s.p->>\'session\', v.m\nFROM (SELECT $1::jsonb AS p) s,\nLATERAL (VALUES\n  (1, jsonb_build_object(\'type\', \'human\', \'content\', s.p->>\'human\', \'additional_kwargs\', \'{}\'::jsonb, \'response_metadata\', \'{}\'::jsonb)),\n  (2, jsonb_build_object(\'type\', \'ai\', \'content\', s.p->>\'ai\', \'tool_calls\', \'[]\'::jsonb, \'additional_kwargs\', \'{}\'::jsonb, \'response_metadata\', \'{}\'::jsonb, \'invalid_tool_calls\', \'[]\'::jsonb))\n) AS v(ord, m)\nORDER BY v.ord;', options: { queryReplacement: expr('{{ JSON.stringify({ session: $(\'Inputs\').first().json.sessionId, human: $(\'Inputs\').first().json.chatInput, ai: $json.text }) }}') } }, credentials: { postgres: newCredential('Postgres account', 'SYGCGSwWZ2h75qim') }, position: [3072, 1200] }
});

const chat_Response = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: { name: 'Chat Response', parameters: { assignments: { assignments: [{ id: 'r1', name: 'output', type: 'string', value: expr('{{ $(\'Generation\').first().json.text }}') }] }, options: {} }, position: [3264, 1200] }
});

const aI_Agent = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: { name: 'AI Agent', parameters: { options: { systemMessage: 'You are an assistant that answers questions about the PDF documents uploaded to the knowledge base.\nFor each question, ALWAYS use the Knowledge Base tool to retrieve the relevant passages, then answer in the language of the question, using only these passages.\nIf the passages do not contain the answer, say clearly that you do not know instead of inventing.\nWhen useful, quote briefly the passage that supports your answer.' } }, position: [1232, 1600], subnodes: { model: google_Gemini_Chat_Model, memory: postgres_Chat_Memory, tools: [knowledge_Base] } }
});

const wf = workflow('fk2W6WklNay9iFUQ', 'RAG n8n : pdf', { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: true });

export default wf
  .add(on_form_submission)
  .to(extract_from_File)
  .to(delete_Previous_Version)
  .to(split_Text_Into_Segments)
  .to(splitInBatches(loop_Over_Items)
  .onEachBatch(supabase_Vector_Store
    .to(wait)
    .to(nextBatch(loop_Over_Items))))
  .add(sticky('### 1. Ingestion\nUpload any PDF with selectable text through the form. The text is extracted and cut into segments of about 16000 characters; each segment is split into chunks (1000 chars, 200 overlap), embedded with Gemini and stored in the Supabase `documents` table with the file name as `source`.\n\nPassages already stored for the same file name are deleted first, so uploading a file again replaces it. A 25 second wait between segments keeps the run under the Gemini rate limit.\n\nScanned PDFs without a text layer are not supported.', [google_Gemini_Embeddings, default_Data_Loader, recursive_Character_Text_Splitter, knowledge_Base], { name: 'Sticky Ingestion', color: 2, width: 1292, height: 652, position: [-192, 208] }))
  .add(when_chat_message_received)
  .to(inputs)
  .to(get_Session_Messages)
  .to(empty_Conversation.onTrue(routing
    .to(search)
    .to(aggregate_Results)
    .to(has_Results.onTrue(reranking
      .to(select_Passages)
      .to(generation)
      .to(save_Messages)
      .to(chat_Response)).onFalse(generation))).onFalse(routing))
  .add(aI_Agent)
  .add(sticky('### 2. Chat (previous version, disconnected)\nAI Agent with the Knowledge Base tool (top 4 chunks) and Postgres Chat Memory. It is replaced by the answering pipeline below and kept for reference.\n\nBoth flows share the same Gemini embeddings node so vectors stay compatible.', [postgres_Chat_Memory], { name: 'Sticky Chat', color: 2, width: 720, height: 320, position: [912, 688] }))
  .add(sticky('### 3. Answering pipeline\nInput (chat) > Context (inputs and session history from Postgres) > Routing (standalone query and keywords) > Search (top 10 passages from Supabase, all uploaded documents) > Reranking (keep the 4 best) > Generation (answer in the language of the question, with the source file name) > history saved to Postgres.\n\nThe AI Agent above is kept but disconnected while this pipeline is validated.', [when_chat_message_received, aI_Agent, google_Gemini_Chat_Model, inputs, get_Session_Messages, empty_Conversation, routing, routing_Output_Parser, search, aggregate_Results, reranking, reranking_Output_Parser, select_Passages, generation, save_Messages, chat_Response, has_Results], { name: 'Sticky Answering', color: 2, width: 2860, height: 800, position: [608, 992] }))