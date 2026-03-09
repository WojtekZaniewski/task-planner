// TokenBridgePlugin.swift
// Add this file to the MAIN app target (not the widget target) in Xcode.
// This is a Capacitor plugin that receives the Supabase token from JS
// and writes it to App Group UserDefaults so the widget can read it.
//
// After adding this file, register the plugin in your AppDelegate.swift:
//   import Capacitor
//   // In application(_:didFinishLaunchingWithOptions:):
//   // Capacitor auto-discovers plugins, no manual registration needed.

import Foundation
import Capacitor

@objc(TokenBridgePlugin)
public class TokenBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TokenBridgePlugin"
    public let jsName = "TokenBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setToken", returnType: CAPPluginReturnPromise)
    ]

    private let appGroup = "group.com.yourname.tasks"

    @objc func setToken(_ call: CAPPluginCall) {
        let token = call.getString("token") ?? ""
        UserDefaults(suiteName: appGroup)?.set(token, forKey: "supabase_access_token")
        WidgetCenter.shared.reloadAllTimelines()
        call.resolve()
    }
}
