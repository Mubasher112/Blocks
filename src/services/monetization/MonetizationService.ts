import { AdService } from './AdService';
import { PurchaseService } from './PurchaseService';
import { EntitlementService } from './EntitlementService';
import { ConsentService } from './ConsentService';

export class MonetizationService {
  public static ads = AdService;
  public static purchases = PurchaseService;
  public static entitlements = EntitlementService;
  public static consent = ConsentService;
}
