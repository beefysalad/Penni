import Foundation

#if canImport(FoundationModels)
import FoundationModels
#endif

@objc(PenniAI)
final class PenniAI: NSObject {
  private func availabilityPayload() -> [String: Any] {
    #if canImport(FoundationModels)
    if #available(iOS 26.0, *) {
      let model = SystemLanguageModel.default

      switch model.availability {
      case .available:
        return [
          "isAvailable": true,
          "reason": "available",
          "message": "Apple Intelligence is available on this device."
        ]
      case .unavailable(.deviceNotEligible):
        return [
          "isAvailable": false,
          "reason": "device_not_eligible",
          "message": "This device does not support Apple Intelligence."
        ]
      case .unavailable(.appleIntelligenceNotEnabled):
        return [
          "isAvailable": false,
          "reason": "apple_intelligence_not_enabled",
          "message": "Apple Intelligence is turned off in Settings."
        ]
      case .unavailable(.modelNotReady):
        return [
          "isAvailable": false,
          "reason": "model_not_ready",
          "message": "Apple Intelligence is still downloading or preparing model assets."
        ]
      case .unavailable:
        return [
          "isAvailable": false,
          "reason": "unavailable",
          "message": "Apple Intelligence is unavailable on this device right now."
        ]
      }
    } else {
      return [
        "isAvailable": false,
        "reason": "ios_version_unsupported",
        "message": "Apple Intelligence summaries need iOS 26 or newer."
      ]
    }
    #else
    return [
      "isAvailable": false,
      "reason": "framework_unavailable",
      "message": "Foundation Models is unavailable in this build."
    ]
    #endif
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(getAvailability:rejecter:)
  func getAvailability(
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    resolver(availabilityPayload())
  }

  @objc(generateSummary:resolver:rejecter:)
  func generateSummary(
    _ prompt: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    #if canImport(FoundationModels)
    if #available(iOS 26.0, *) {
      let availability = availabilityPayload()
      if let isAvailable = availability["isAvailable"] as? Bool, !isAvailable {
        resolver(availability["message"] as? String ?? "Apple Intelligence is unavailable.")
        return
      }

      Task {
        do {
          var session = LanguageModelSession()
          let response = try await session.respond(to: prompt)
          let content = response.content.trimmingCharacters(in: .whitespacesAndNewlines)

          if content.isEmpty {
            resolver("Penni could not generate a summary from the current activity yet.")
            return
          }

          resolver(content)
        } catch {
          rejecter("penni_ai_failed", error.localizedDescription, error)
        }
      }
    } else {
      resolver("Apple Intelligence summaries need a supported iPhone and newer iOS version.")
    }
    #else
    resolver("Apple Intelligence summaries are unavailable in this build environment.")
    #endif
  }
}
