import { ChangeEvent, FC, useEffect, useRef } from 'react';
import { ChartNode } from '../../model/NodeBase';
import { monaco } from '../../utils/monaco';
import styled from '@emotion/styled';
import { PromptNode, PromptNodeData } from '../../model/nodes/PromptNode';
import { useLatest } from 'ahooks';
import Toggle from '@atlaskit/toggle';

export type PromptNodeEditorProps = {
  node: ChartNode;
  onChange?: (node: ChartNode) => void;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;

  .editor-container {
    flex: 1;
    min-height: 200px;
  }

  .options {
    font-family: 'Roboto', sans-serif;
    color: var(--foreground);
    background-color: var(--grey-darker);

    display: grid;
    grid-template-columns: auto 1fr auto;
    row-gap: 16px;
    column-gap: 32px;
    align-items: center;
    grid-auto-rows: 40px;

    .row {
      display: contents;
    }

    .label {
      font-weight: 500;
      color: var(--foreground);
    }

    .select,
    .number-input {
      padding: 6px 12px;
      background-color: var(--grey-darkish);
      border: 1px solid var(--grey);
      border-radius: 4px;
      color: var(--foreground);
      outline: none;
      transition: border-color 0.3s;

      &:hover {
        border-color: var(--primary);
      }

      &:disabled {
        background-color: var(--grey-dark);
        border-color: var(--grey);
        color: var(--foreground-dark);
      }
    }

    .select {
      justify-self: start;
      width: 150px;
    }

    .number-input {
      justify-self: start;
      min-width: 0;
      width: 100px;
    }

    .checkbox-input {
      margin-left: 8px;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }
`;

const handleInputChange =
  (key: keyof PromptNodeData, node: PromptNode, onChange?: (node: ChartNode<'prompt', PromptNodeData>) => void) =>
  (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    onChange?.({
      ...node,
      data: {
        ...node.data,
        [key]: value,
      },
    });
  };

export const PromptNodeEditor: FC<PromptNodeEditorProps> = ({ node, onChange }) => {
  const editorContainer = useRef<HTMLDivElement>(null);
  const promptNode = node as PromptNode;
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor>();

  const onChangeLatest = useLatest(onChange);
  const nodeLatest = useLatest(promptNode);

  useEffect(() => {
    if (!editorContainer.current) {
      return;
    }

    const editor = monaco.editor.create(editorContainer.current, {
      theme: 'prompt-interpolation',
      lineNumbers: 'off',
      glyphMargin: false,
      folding: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
      language: 'prompt-interpolation',
      minimap: {
        enabled: false,
      },
      value: nodeLatest.current?.data.promptText,
      wordWrap: 'on',
    });
    editor.onDidChangeModelContent(() => {
      onChangeLatest.current?.({
        ...nodeLatest.current,
        data: {
          ...nodeLatest.current?.data,
          promptText: editor.getValue(),
        },
      });
    });

    editorInstance.current = editor;

    return () => {
      editor.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editorInstance.current) {
      editorInstance.current.setValue(nodeLatest.current?.data.promptText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  return (
    <Container>
      <div className="options">
        <div className="row">
          <label className="label" htmlFor="model">
            Type
          </label>
          <select
            id="model"
            className="select"
            value={promptNode.data.type}
            onChange={handleInputChange('type', promptNode, onChange)}
          >
            <option value="user">User</option>
            <option value="system">System</option>
            <option value="ai">AI</option>
          </select>
          <Toggle
            id="useModelInput"
            isChecked={promptNode.data.useTypeInput}
            onChange={handleInputChange('useTypeInput', promptNode, onChange)}
          />
        </div>
      </div>

      <div ref={editorContainer} className="editor-container" />
    </Container>
  );
};