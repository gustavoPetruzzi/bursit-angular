import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

const BASE_TOKEN_PATH = 'node_modules/bursit-ui-tokens/tokens.css';
const COMPONENT_TOKEN_PATH = 'node_modules/bursit-ui-tokens/index.css';

export function ngAdd(options: { includeComponentTokens?: boolean }): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const configPaths = ['angular.json', 'workspace.json'];
    let configPath: string | null = null;
    let configBuffer: Buffer | null = null;

    for (const path of configPaths) {
      if (tree.exists(path)) {
        configPath = path;
        configBuffer = tree.read(path);
        break;
      }
    }

    if (!configPath || !configBuffer) {
      throw new Error(
        'Could not find angular.json or workspace.json. ' +
          'Please make sure you are in an Angular CLI workspace.'
      );
    }

    let workspace: any;
    try {
      workspace = JSON.parse(configBuffer.toString());
    } catch (e) {
      throw new Error(`Failed to parse ${configPath}: ${e}`);
    }

    const projects = workspace.projects;
    if (!projects || typeof projects !== 'object') {
      context.logger.warn('No projects found in workspace configuration.');
      return tree;
    }

    const includeComponentTokens = options.includeComponentTokens !== false;
    const targetStylePath = includeComponentTokens
      ? COMPONENT_TOKEN_PATH
      : BASE_TOKEN_PATH;
    const excludedPath = includeComponentTokens
      ? BASE_TOKEN_PATH
      : COMPONENT_TOKEN_PATH;

    let modified = false;

    for (const projectName of Object.keys(projects)) {
      const project = projects[projectName];
      const buildTarget =
        project?.architect?.build ?? project?.targets?.build;

      if (!buildTarget) {
        context.logger.info(
          `Skipping project "${projectName}" — no build target found.`
        );
        continue;
      }

      const options = buildTarget.options || {};
      const styles: string[] = options.styles || [];

      // Remove the excluded path if it exists to avoid duplication
      const excludedIndex = styles.indexOf(excludedPath);
      if (excludedIndex !== -1) {
        styles.splice(excludedIndex, 1);
        modified = true;
        context.logger.info(
          `Removing "${excludedPath}" from styles for project "${projectName}".`
        );
      }

      if (!styles.includes(targetStylePath)) {
        styles.push(targetStylePath);
        modified = true;
        context.logger.info(
          `Adding "${targetStylePath}" to styles for project "${projectName}".`
        );
      } else {
        context.logger.info(
          `Project "${projectName}" already includes "${targetStylePath}".`
        );
      }
    }

    if (modified) {
      tree.overwrite(configPath, JSON.stringify(workspace, null, 2) + '\n');
      context.logger.info(`${configPath} updated successfully.`);
    } else {
      context.logger.info('No changes were necessary.');
    }

    return tree;
  };
}
