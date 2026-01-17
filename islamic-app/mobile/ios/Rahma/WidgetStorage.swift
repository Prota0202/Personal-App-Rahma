import Foundation
import React

@objc(WidgetStorage)
class WidgetStorage: NSObject, RCTBridgeModule {
  static func moduleName() -> String! {
    return "WidgetStorage"
  }

  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func setSnapshot(_ json: String) {
    let defaults = UserDefaults(suiteName: "group.com.rahma.app")
    defaults?.set(json, forKey: "rahma.widget.snapshot")
    defaults?.synchronize()
  }
}
