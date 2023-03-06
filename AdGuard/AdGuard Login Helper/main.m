//
//  main.m
//  AdGuard Login Helper
//
//  Created by Roman Sokolov on 28/10/2019.
//  Copyright © 2020 AdGuard Software Ltd. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import "AESharedResources.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        // Check if main app is already running; if yes, do nothing and terminate helper app
        BOOL alreadyRunning = NO;
        NSArray *running = [[NSWorkspace sharedWorkspace] runningApplications];
        for (NSRunningApplication *app in running) {
            if ([[app bundleIdentifier] isEqualToString:AG_BUNDLEID]) {
                alreadyRunning = YES;
                break;
            }
        }
        
        if (!alreadyRunning) {
            
            NSString *appPath = [[[[[[NSBundle mainBundle] bundlePath] stringByDeletingLastPathComponent] stringByDeletingLastPathComponent]  stringByDeletingLastPathComponent] stringByDeletingLastPathComponent];
            // get to the waaay top. Goes through LoginItems, Library, Contents, Applications
            NSURL *url = [NSURL fileURLWithPath:appPath];
            if (url == nil) {
                NSLog(@"AdGuard For Safari Login Helper: Can't obtain URL for Main App.");
            }
            else {
                NSLog(@"AdGuard For Safari Login Helper: Try laungh: %@", url);
                
                dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
                
                [AESharedResources setLaunchInBackground:YES completion:^{
                    dispatch_semaphore_signal(semaphore);
                }];
                
                // timeout after 1 second
                dispatch_time_t timeout = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC));
                dispatch_semaphore_wait(semaphore, timeout);
                
                NSError *lError = nil;
                NSRunningApplication *app = [[NSWorkspace sharedWorkspace] launchApplicationAtURL:url
                                                                                          options:0
                                                                                    configuration:@{}
                                                                                            error:&lError];
                if (app == nil && lError != nil) {
                    NSLog(@"AdGuard For Safari Login Helper: Error occurs when running: %@", lError);
                }
                else {
                    NSLog(@"AdGuard For Safari Login Helper: App \"%@\" launched.", url);
                }
            }
        }
    }
    
    return 0;
}
