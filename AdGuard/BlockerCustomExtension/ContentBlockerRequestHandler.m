//
//  ContentBlockerRequestHandler.m
//
//  Created by Dimitry Kolyshev on 25.07.2019.
//  Copyright © 2020 AdGuard Software Ltd. All rights reserved.
//

#import "ContentBlockerRequestHandler.h"
#import "AESharedResources.h"

@implementation ContentBlockerRequestHandler

- (NSURL *)blockingContentRulesUrl {
    return AESharedResources.blockingContentCustomUrl;
}

@end
