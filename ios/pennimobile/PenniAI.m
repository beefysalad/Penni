#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PenniAI, NSObject)

RCT_EXTERN_METHOD(getAvailability:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(generateSummary:(NSString *)prompt
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
