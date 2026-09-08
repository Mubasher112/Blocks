import { StorageService } from '../Storage';
import { ConsentStatus } from '../../game/monetization/MonetizationTypes';

const LOCAL_CONSENT_KEY = 'block_nova_user_consent_status';

export class ConsentService {
  /**
   * Get current privacy consent status
   */
  public static async getConsentStatus(): Promise<ConsentStatus> {
    const status = await StorageService.getItem<ConsentStatus>(LOCAL_CONSENT_KEY);
    return status || 'NOT_APPLICABLE';
  }

  /**
   * Set privacy consent status
   */
  public static async setConsentStatus(status: ConsentStatus): Promise<void> {
    await StorageService.setItem(LOCAL_CONSENT_KEY, status);
  }
}
