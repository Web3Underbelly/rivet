import { ChartNode, NodeConnection, NodeId, NodeInputDefinition, NodeOutputDefinition, PortId } from '../NodeBase';
import { nanoid } from 'nanoid';
import { NodeImpl } from '../NodeImpl';
import { Inputs, Outputs } from '../GraphProcessor';
import { entries } from '../../utils/typeSafety';

export type ArrayNode = ChartNode<'array', ArrayNodeData>;

export type ArrayNodeData = {};

export class ArrayNodeImpl extends NodeImpl<ArrayNode> {
  static create(): ArrayNode {
    const chartNode: ArrayNode = {
      type: 'array',
      title: 'Array',
      id: nanoid() as NodeId,
      visualData: {
        x: 0,
        y: 0,
        width: 200,
      },
      data: {},
    };

    return chartNode;
  }

  getInputDefinitions(connections: NodeConnection[]): NodeInputDefinition[] {
    const inputs: NodeInputDefinition[] = [];
    const inputCount = this.#getInputPortCount(connections);

    for (let i = 1; i <= inputCount; i++) {
      inputs.push({
        dataType: 'any',
        id: `input${i}` as PortId,
        title: `Input ${i}`,
      });
    }

    return inputs;
  }

  getOutputDefinitions(): NodeOutputDefinition[] {
    return [
      {
        dataType: 'any[]',
        id: 'output' as PortId,
        title: 'Output',
      },
    ];
  }

  #getInputPortCount(connections: NodeConnection[]): number {
    const inputNodeId = this.chartNode.id;
    const inputConnections = connections.filter(
      (connection) => connection.inputNodeId === inputNodeId && connection.inputId.startsWith('input'),
    );

    let maxInputNumber = 0;
    for (const connection of inputConnections) {
      const inputNumber = parseInt(connection.inputId.replace('input', ''));
      if (inputNumber > maxInputNumber) {
        maxInputNumber = inputNumber;
      }
    }

    return maxInputNumber + 1;
  }

  async process(inputs: Inputs): Promise<Outputs> {
    const outputArray: any[] = [];

    for (const [key, input] of entries(inputs)) {
      if (key.startsWith('input')) {
        outputArray.push(input.value);
      }
    }

    return {
      ['output' as PortId]: {
        type: 'any[]',
        value: outputArray,
      },
    };
  }
}
