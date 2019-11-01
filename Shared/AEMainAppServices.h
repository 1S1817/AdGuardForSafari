//
//  AEMainAppServices.h
//  shared
//
//  Created by Roman Sokolov on 05/09/2019.
//  Copyright © 2019 Adguard Software Ltd. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface AEMainAppServices : NSObject

/**
 Must be called on initialization of the Main App.
 At this moment listens on:
    `AllExtensionEnabledRequest`
 */
+ (void)startListenerForRequestsToMainApp;

@property (class, nonatomic) BOOL startAtLogin;

/// Try to remove old login item
/// @param completion Called on main thread
+ (void)removeOldLoginItemWithCompletion:(void (^)(BOOL result))completion;

@end

NS_ASSUME_NONNULL_END
