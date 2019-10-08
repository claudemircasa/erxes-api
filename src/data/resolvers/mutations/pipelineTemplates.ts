import { PipelineTemplates } from '../../../db/models';
import { IPipelineTemplate, IPipelineTemplateStage } from '../../../db/models/definitions/pipelineTemplates';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';
import { checkPermission } from '../boardUtils';

interface IPipelineTemplatesEdit extends IPipelineTemplate {
  _id: string;
  stages: IPipelineTemplateStage[];
}

const pipelineTemplateMutations = {
  /**
   * Create new pipeline template
   */
  async pipelineTemplatesAdd(_root, { stages, ...doc }: IPipelineTemplate, { user, docModifier }: IContext) {
    await checkPermission(doc.type, user, 'templatesAdd');

    const pipelineTemplate = await PipelineTemplates.createPipelineTemplate(
      docModifier({ createdBy: user._id, ...doc }),
      stages,
    );

    await putCreateLog(
      {
        type: 'pipelineTemplate',
        newData: JSON.stringify(doc),
        description: `${doc.name} has been created`,
        object: pipelineTemplate,
      },
      user,
    );

    return pipelineTemplate;
  },

  /**
   * Edit pipeline template
   */
  async pipelineTemplatesEdit(_root, { _id, stages, ...doc }: IPipelineTemplatesEdit, { user, docModifier }: IContext) {
    await checkPermission(doc.type, user, 'templatesEdit');

    const pipelineTemplate = await PipelineTemplates.findOne({ _id });

    const updated = await PipelineTemplates.updatePipelineTemplate(_id, docModifier(doc), stages);

    if (pipelineTemplate) {
      await putUpdateLog(
        {
          type: 'pipelineTemplate',
          newData: JSON.stringify(doc),
          description: `${doc.name} has been edited`,
          object: pipelineTemplate,
        },
        user,
      );
    }

    return updated;
  },

  /**
   * Duplicate pipeline template
   */
  async pipelineTemplatesDuplicate(_root, { _id }: { _id: string }, { user }: IContext) {
    const pipelineTemplate = await PipelineTemplates.findOne({ _id });

    if (pipelineTemplate) {
      await checkPermission(pipelineTemplate.type, user, 'templatesDuplicate');
    }

    return PipelineTemplates.duplicatePipelineTemplate(_id);
  },

  /**
   * Remove pipeline template
   */
  async pipelineTemplatesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const pipelineTemplate = await PipelineTemplates.findOne({ _id });

    if (pipelineTemplate) {
      await checkPermission(pipelineTemplate.type, user, 'templatesRemove');
    }

    const removed = await PipelineTemplates.removePipelineTemplate(_id);

    if (pipelineTemplate && removed) {
      await putDeleteLog(
        {
          type: 'pipelineTemplate',
          object: pipelineTemplate,
          description: `${pipelineTemplate.name} has been removed`,
        },
        user,
      );
    }
  },
};

export default pipelineTemplateMutations;