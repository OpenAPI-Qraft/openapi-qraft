import ts from 'typescript';
import {
  createServicesMutationOperationNodes,
  createServicesQueryOperationNodes,
} from './serviceOperationNodes.js';

/**
 * Extracts method names from interfaces in AST nodes
 */
function extractMethodNamesFromInterfaces(nodes: ts.Node[]): string[] {
  const methodNames: string[] = [];

  // Recursive traversal to find interfaces
  function visitNode(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node)) {
      // Extract method names from interface members
      node.members.forEach((member) => {
        if (ts.isMethodSignature(member) && ts.isIdentifier(member.name)) {
          methodNames.push(member.name.text);
        }
      });
    }

    ts.forEachChild(node, visitNode);
  }

  nodes.forEach(visitNode);

  return [...new Set(methodNames)]; // Remove duplicates
}

/**
 * Returns a list of all available callback function names
 */
export function getAllAvailableCallbackNames(): string[] {
  const queryNodes = createServicesQueryOperationNodes({
    omitOperationQueryFnNodes: true,
  });
  const mutationNodes = createServicesMutationOperationNodes();

  const queryMethodNames = extractMethodNamesFromInterfaces(queryNodes);
  const mutationMethodNames = extractMethodNamesFromInterfaces(mutationNodes);

  return [...new Set([...queryMethodNames, ...mutationMethodNames])].sort();
}
