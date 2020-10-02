import { Webhooks } from '../../../db/models';
import { IWebhook } from '../../../db/models/definitions/webhook';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { checkPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IWebhookEdit extends IWebhook {
  _id: string;
}

const webhookMutations = {
  /**
   * Creates a new webhook
   */
  async webhooksAdd(_root, doc: IWebhook, { user, docModifier }: IContext) {
    const webhook = await Webhooks.createWebhook(docModifier(doc));

    await putCreateLog(
      {
        type: MODULE_NAMES.WEBHOOK,
        newData: webhook,
        object: webhook,
        description: `${webhook.url} has been created`,
      },
      user,
    );

    return webhook;
  },

  /**
   * Edits a webhook
   */
  async webhooksEdit(_root, { _id, ...doc }: IWebhookEdit, { user }: IContext) {
    const webhook = await Webhooks.getWebHook(_id);
    const updated = await Webhooks.updateWebhook(_id, doc);

    await putUpdateLog(
      {
        type: MODULE_NAMES.WEBHOOK,
        object: webhook,
        newData: doc,
        description: `${webhook.url} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Removes a webhook
   */
  async webhooksRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const webhook = await Webhooks.getWebHook(_id);
    const removed = await Webhooks.removeWebhooks(_id);

    await putDeleteLog(
      {
        type: MODULE_NAMES.WEBHOOK,
        object: webhook,
        description: `${webhook.url} has been removed`,
      },
      user,
    );

    return removed;
  },
};

checkPermission(webhookMutations, 'webhooksAdd', 'manageWebhooks');
checkPermission(webhookMutations, 'webhooksEdit', 'manageWebhooks');
checkPermission(webhookMutations, 'webhooksRemove', 'manageWebhooks');

export default webhookMutations;