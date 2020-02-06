import { BUNDLE_RUNTIME_NAMES } from '../bundleRuntime/bundleRuntimeCore';
import { sourceMapsCSSURL } from '../bundleRuntime/constants';
import { IStyleSheetProps } from '../config/IStylesheetProps';
import { Context } from '../core/context';
import { IModule } from '../moduleResolver/module';
import { wrapContents } from '../plugins/pluginStrings';
import { fastHash, joinFuseBoxPath } from '../utils/utils';
import { IStylesheetModuleResponse } from './interfaces';

export interface ICSSModuleRender {
  ctx: Context;
  data: IStylesheetModuleResponse;
  module: IModule;
  options: IStyleSheetProps;
  useDefault?: boolean;
}
export function cssDevModuleRender(props: ICSSModuleRender) {
  const { ctx, data, module } = props;
  const filePath = module.publicPath;
  // let the context know

  let cssData = data.css;

  if (ctx.config.sourceMap.css && data.map) {
    const resourceConfig = ctx.config.getResourceConfig(props.options);

    // generating a new name for our sourcemap
    const name = `${fastHash(module.absPath)}.css.map`;
    // defining a public path (that browser will be able to reach)
    const publicPath = joinFuseBoxPath(resourceConfig.resourcePublicRoot, 'css', name);

    // replace existing sourceMappingURL
    if (/sourceMappingURL/.test(cssData)) {
      cssData = cssData.replace(/(sourceMappingURL=)([^\s]+)/, `$1${publicPath}`);
    } else {
      cssData += sourceMapsCSSURL(publicPath);
    }

    // figuring out where to write that css

    //const targetSourceMapPath = path.join(resourceConfig.resourceFolder, 'css', name);

    // ctx.log.info('css', 'Writing css sourcemap to $file', { file: targetSourceMapPath });
    // ctx.writer.write(targetSourceMapPath, data.map);
  }

  const fuseBoxCSSModuleId = ctx.systemDependencies['fuse-box-css'];
  if (fuseBoxCSSModuleId) {
    const methodString = BUNDLE_RUNTIME_NAMES.ARG_REQUIRE_FUNCTION + '(' + fuseBoxCSSModuleId + ')';
    let contents = `${methodString}(${JSON.stringify(filePath)},${JSON.stringify(cssData)})`;
    if (props.data.json) {
      contents += '\n' + wrapContents(JSON.stringify(props.data.json), props.useDefault);
    }
    module.contents = contents;
  }
}
