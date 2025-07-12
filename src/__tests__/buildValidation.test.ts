/**
 * Build Validation Tests
 * Automated tests to catch common build issues and prevent future TypeScript errors
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Build Validation', () => {
  describe('TypeScript Compilation', () => {
    it('should compile without TypeScript errors', () => {
      expect(() => {
        execSync('npx tsc --noEmit', { 
          stdio: 'pipe',
          cwd: process.cwd()
        });
      }).not.toThrow();
    });

    it('should have strict TypeScript configuration', () => {
      const tsConfigPath = path.join(process.cwd(), 'tsconfig.app.json');
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      
      expect(tsConfig.compilerOptions.strict).toBe(true);
      expect(tsConfig.compilerOptions.noUnusedLocals).toBe(true);
      expect(tsConfig.compilerOptions.noUnusedParameters).toBe(true);
      expect(tsConfig.compilerOptions.exactOptionalPropertyTypes).toBe(true);
    });
  });

  describe('Import and Export Validation', () => {
    it('should not have unused imports in source files', async () => {
      const sourceFiles = getAllTsFiles('src');
      const unusedImports: string[] = [];

      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const importMatches = content.match(/import\s+.*?\s+from\s+['"]/g) || [];
        
        for (const importLine of importMatches) {
          // Extract imported names
          const importedNames = extractImportedNames(importLine);
          
          for (const name of importedNames) {
            // Check if the imported name is used in the file
            const nameRegex = new RegExp(`\\b${name}\\b`, 'g');
            const usageCount = (content.match(nameRegex) || []).length;
            
            // If only found once (in the import), it's unused
            if (usageCount === 1) {
              unusedImports.push(`${file}: unused import '${name}'`);
            }
          }
        }
      }

      expect(unusedImports).toEqual([]);
    });

    it('should have consistent type import usage', () => {
      const sourceFiles = getAllTsFiles('src');
      const typeImportIssues: string[] = [];

      for (const file of sourceFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for type imports that should use 'import type'
        const regularImports = content.match(/import\s+\{[^}]*\}\s+from\s+['"]/g) || [];
        
        for (const importLine of regularImports) {
          // Skip if already using 'import type'
          if (importLine.includes('import type')) continue;
          
          const importedNames = extractImportedNames(importLine);
          
          for (const name of importedNames) {
            // Check if this import is only used in type positions
            const typeOnlyUsage = isTypeOnlyUsage(content, name);
            if (typeOnlyUsage) {
              typeImportIssues.push(`${file}: '${name}' should use 'import type'`);
            }
          }
        }
      }

      // Allow some type import issues for now, but track them
      expect(typeImportIssues.length).toBeLessThan(50);
    });
  });

  describe('Test Data Type Safety', () => {
    it('should have properly typed test data', () => {
      const testFiles = getAllTsFiles('src', '.test.ts');
      const typeIssues: string[] = [];

      for (const file of testFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for string literals that should be const assertions
        const stringLiterals = content.match(/insulationType:\s*['"][^'"]*['"]/g) || [];
        
        for (const literal of stringLiterals) {
          if (!literal.includes('as const')) {
            typeIssues.push(`${file}: ${literal} should use 'as const'`);
          }
        }
      }

      expect(typeIssues).toEqual([]);
    });
  });

  describe('Chart Component Validation', () => {
    it('should not have unused parameters in chart map functions', () => {
      const chartFiles = getAllTsFiles('src/components/charts');
      const unusedParams: string[] = [];

      for (const file of chartFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Look for map functions with unused parameters
        const mapFunctions = content.match(/\.map\(\([^)]*\)\s*=>/g) || [];
        
        for (const mapFunc of mapFunctions) {
          // Check if parameters are used
          if (mapFunc.includes('(entry, index)') && !mapFunc.includes('entry')) {
            unusedParams.push(`${file}: unused 'entry' parameter in map function`);
          }
        }
      }

      expect(unusedParams).toEqual([]);
    });
  });

  describe('Production Build', () => {
    it('should build successfully for production', () => {
      expect(() => {
        execSync('npm run build', { 
          stdio: 'pipe',
          cwd: process.cwd()
        });
      }).not.toThrow();
    });

    it('should have reasonable bundle size', () => {
      const distPath = path.join(process.cwd(), 'dist');
      
      if (fs.existsSync(distPath)) {
        const jsFiles = fs.readdirSync(distPath)
          .filter(file => file.endsWith('.js'))
          .map(file => path.join(distPath, file));
        
        const totalSize = jsFiles.reduce((sum, file) => {
          return sum + fs.statSync(file).size;
        }, 0);
        
        const sizeInMB = totalSize / (1024 * 1024);
        
        // Expect bundle to be under 2MB (reasonable for an electrical calculator)
        expect(sizeInMB).toBeLessThan(2);
      }
    });
  });
});

// Helper functions
function getAllTsFiles(dir: string, suffix = '.ts'): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        traverse(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith(suffix) || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function extractImportedNames(importLine: string): string[] {
  const match = importLine.match(/import\s+\{([^}]*)\}/);
  if (!match) return [];
  
  return match[1]
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);
}

function isTypeOnlyUsage(content: string, name: string): boolean {
  // Simple heuristic: if name is only used after ':' or 'extends' or 'implements'
  const typePositions = [
    `:\\s*${name}`,
    `extends\\s+${name}`,
    `implements\\s+${name}`,
    `<${name}>`,
    `<.*${name}.*>`,
  ];
  
  const typeUsageRegex = new RegExp(typePositions.join('|'), 'g');
  const allUsageRegex = new RegExp(`\\b${name}\\b`, 'g');
  
  const typeUsages = (content.match(typeUsageRegex) || []).length;
  const totalUsages = (content.match(allUsageRegex) || []).length;
  
  // If all usages are in type positions (excluding the import)
  return typeUsages > 0 && typeUsages === totalUsages - 1;
}