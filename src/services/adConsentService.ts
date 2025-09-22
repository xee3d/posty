import { AdsConsent } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConsentInfo {
  canRequestAds: boolean;
  canShowPersonalizedAds: boolean;
  privacyOptionsRequired: boolean;
  consentStatus: 'UNKNOWN' | 'REQUIRED' | 'NOT_REQUIRED' | 'OBTAINED';
}

class AdConsentService {
  private isInitialized = false;
  private readonly CONSENT_KEY = 'posty_ad_consent';

  async initialize(): Promise<ConsentInfo> {
    try {
      console.log('🎯 AdConsent: Initializing UMP...');

      // Development bypass - AdMob app not yet approved
      if (__DEV__) {
        console.log('🔧 AdConsent: Development mode - bypassing UMP');
        return {
          canRequestAds: true,
          canShowPersonalizedAds: false,
          privacyOptionsRequired: false,
          consentStatus: 'NOT_REQUIRED'
        };
      }

      // Request consent information update
      const consentInfo = await AdsConsent.requestInfoUpdate();

      console.log('🎯 AdConsent: Info updated', {
        canRequestAds: consentInfo.canRequestAds,
        isConsentFormAvailable: consentInfo.isConsentFormAvailable,
        status: consentInfo.status
      });

      // If consent form is available and consent is required, show the form
      if (consentInfo.isConsentFormAvailable && consentInfo.status === 'REQUIRED') {
        console.log('🎯 AdConsent: Showing consent form...');

        const formResult = await AdsConsent.showForm();
        console.log('🎯 AdConsent: Form result', formResult);

        // Save consent status
        await this.saveConsentStatus(formResult.status);
      }

      // Check if we can request ads
      const finalInfo = await AdsConsent.requestInfoUpdate();

      const result: ConsentInfo = {
        canRequestAds: finalInfo.canRequestAds,
        canShowPersonalizedAds: await this.canShowPersonalizedAds(),
        privacyOptionsRequired: finalInfo.privacyOptionsRequirementStatus === 'REQUIRED',
        consentStatus: finalInfo.status
      };

      this.isInitialized = true;
      console.log('✅ AdConsent: Initialization complete', result);

      return result;
    } catch (error) {
      console.error('❌ AdConsent: Initialization failed', error);

      // Return safe defaults on error
      return {
        canRequestAds: true, // Allow ads but non-personalized
        canShowPersonalizedAds: false,
        privacyOptionsRequired: false,
        consentStatus: 'UNKNOWN'
      };
    }
  }

  async showPrivacyOptionsForm(): Promise<void> {
    try {
      // Development bypass
      if (__DEV__) {
        console.log('🔧 AdConsent: Development mode - privacy options unavailable');
        return;
      }

      console.log('🎯 AdConsent: Showing privacy options form...');
      await AdsConsent.showPrivacyOptionsForm();
      console.log('✅ AdConsent: Privacy options form completed');
    } catch (error) {
      console.error('❌ AdConsent: Privacy options form error', error);
      throw error;
    }
  }

  async resetConsentInfo(): Promise<void> {
    try {
      console.log('🎯 AdConsent: Resetting consent info...');
      await AdsConsent.reset();
      await AsyncStorage.removeItem(this.CONSENT_KEY);
      this.isInitialized = false;
      console.log('✅ AdConsent: Reset complete');
    } catch (error) {
      console.error('❌ AdConsent: Reset failed', error);
      throw error;
    }
  }

  async getCurrentConsentInfo(): Promise<ConsentInfo | null> {
    try {
      if (!this.isInitialized) {
        return null;
      }

      const consentInfo = await AdsConsent.requestInfoUpdate();

      return {
        canRequestAds: consentInfo.canRequestAds,
        canShowPersonalizedAds: await this.canShowPersonalizedAds(),
        privacyOptionsRequired: consentInfo.privacyOptionsRequirementStatus === 'REQUIRED',
        consentStatus: consentInfo.status
      };
    } catch (error) {
      console.error('❌ AdConsent: Failed to get current info', error);
      return null;
    }
  }

  private async canShowPersonalizedAds(): Promise<boolean> {
    try {
      const consentInfo = await AdsConsent.requestInfoUpdate();

      // Check if user has consented to personalized ads
      // This is a simplified check - actual implementation may vary
      return consentInfo.canRequestAds && consentInfo.status === 'OBTAINED';
    } catch (error) {
      console.error('❌ AdConsent: Failed to check personalized ads', error);
      return false;
    }
  }

  private async saveConsentStatus(status: string): Promise<void> {
    try {
      const consentData = {
        status,
        timestamp: new Date().toISOString()
      };

      await AsyncStorage.setItem(this.CONSENT_KEY, JSON.stringify(consentData));
      console.log('💾 AdConsent: Status saved', consentData);
    } catch (error) {
      console.error('❌ AdConsent: Failed to save status', error);
    }
  }

  // Check if user is in EEA/UK (where GDPR applies)
  async isSubjectToGDPR(): Promise<boolean> {
    try {
      const consentInfo = await AdsConsent.requestInfoUpdate();
      return consentInfo.status !== 'NOT_REQUIRED';
    } catch (error) {
      console.error('❌ AdConsent: Failed to check GDPR status', error);
      return false;
    }
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

export const adConsentService = new AdConsentService();
export default adConsentService;