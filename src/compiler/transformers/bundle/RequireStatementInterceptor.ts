import { IVisit, IVisitorMod } from '../../Visitor/Visitor';
import { isLocalDefined } from '../../helpers/astHelpers';
import { ITransformer } from '../../interfaces/ITransformer';
import { ImportType } from '../../interfaces/ImportType';

export function RequireStatementInterceptor(): ITransformer {
  return {
    commonVisitors: props => {
      return {
        onEachNode: (visit: IVisit): IVisitorMod => {
          const { node } = visit;
          if (!props.onRequireCallExpression) return;
          if (node.type === 'CallExpression' && node.callee.name === 'require' && !node['emitted']) {
            if (!isLocalDefined('require', visit.scope)) props.onRequireCallExpression(ImportType.REQUIRE, node);
          }
          return;
        },
      };
    },
  };
}