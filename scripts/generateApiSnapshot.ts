/* eslint-disable */

import {
  Project,
  SyntaxKind,
  Node,
  MethodDeclaration,
  ClassDeclaration,
  InterfaceDeclaration,
} from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';

const distDir = path.resolve(__dirname, '../dist');
const snapshotPath = path.resolve(__dirname, '../api-snapshot.json');

// Set up project with all .d.ts files in dist, respecting exclusions
const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, '../tsconfig.json'),
  skipFileDependencyResolution: true,
  skipAddingFilesFromTsConfig: true,
});

project.addSourceFilesAtPaths(`${distDir}/**/*.d.ts`);

const EXCLUDED_PATTERNS = [
  'internal',
  'procedures',
  'middleware',
  'polkadot',
  'testUtils',
  'sandbox',
  'utils/conversion',
];

// Custom inclusion filter
const files = project.getSourceFiles().filter(file => {
  const filePath = file.getFilePath();

  return !EXCLUDED_PATTERNS.some(
    pattern => filePath.includes(pattern) && !filePath.endsWith('procedures/types.d.ts')
  );
});

function extractMethodOverloads(decl: ClassDeclaration | InterfaceDeclaration) {
  const methodsByName = new Map<string, MethodDeclaration[]>();

  for (const member of decl.getMembers()) {
    if (Node.isMethodDeclaration(member)) {
      const name = member.getName();
      if (!methodsByName.has(name)) methodsByName.set(name, []);
      methodsByName.get(name)!.push(member);
    }
  }

  return Array.from(methodsByName.entries()).map(([name, overloads]) => {
    const signatures = overloads.map(method => {
      const params = method.getParameters().map(param => {
        const type = param.getType().getText(param);
        return {
          name: param.getName(),
          type,
          optional: param.isOptional(),
        };
      });

      const returnType = method.getReturnType().getText(method);
      return { parameters: params, returnType };
    });

    return {
      name,
      overloads: signatures,
    };
  });
}

const snapshot: Record<string, any> = {};

for (const file of files) {
  const exports: any = {};

  file.getClasses().forEach(cls => {
    exports[cls.getName() || 'UnnamedClass'] = extractMethodOverloads(cls);
  });

  file.getInterfaces().forEach(iface => {
    exports[iface.getName() || 'UnnamedInterface'] = extractMethodOverloads(iface);
  });

  if (Object.keys(exports).length > 0) {
    snapshot[path.relative(distDir, file.getFilePath())] = exports;
  }
}

fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');
console.log(`✅ API snapshot saved to: ${snapshotPath}`);
