//
//  AdvancedBlockingTests.swift
//  AdvancedBlockingTests
//
//  Created by Dimitry Kolyshev on 30.01.2019.
//  Copyright © 2019 Adguard Software Ltd. All rights reserved.
//

import XCTest

@testable import AdvancedBlocking

class AdvancedBlockingTests: XCTestCase {
    
    var contentBlockerContainer: ContentBlockerContainer = ContentBlockerContainer();
    
    override func setUp() {
        //contentBlockerContainer = ContentBlockerContainer();
    }
    
    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
    
    func testTriggerUrlFilterAll() {
        let contentBlockerJsonString = """
            [
                {
                    "trigger": {
                        "url-filter": ".*"
                    },
                    "action": {
                        "type": "script",
                        "script": "included-script"
                    }
                },
                {
                    "trigger": {
                        "url-filter": ".*"
                    },
                    "action": {
                        "type": "css",
                        "css": "#included-css:has(div) { height: 5px; }"
                    }
                },
                {
                    "trigger": {
                        "url-filter": "test.com"
                    },
                    "action": {
                        "type": "css",
                        "css": "#excluded-css:has(div) { height: 5px; }"
                    }
                }
            ]
        """;
        
        contentBlockerContainer.setJson(json: contentBlockerJsonString);
        let data: ContentBlockerContainer.BlockerData = contentBlockerContainer.getData(url: URL(fileURLWithPath:"http://example.com")) as! ContentBlockerContainer.BlockerData;
        
        XCTAssert(data.scripts == "included-script");
        XCTAssert(data.css == "#included-css:has(div) { height: 5px; }");
    }
    
    func testTriggerUrlFilter() {
        let contentBlockerJsonString = """
            [
                {
                    "trigger": {
                        "url-filter": "example.com"
                    },
                    "action": {
                        "type": "script",
                        "script": "included-script"
                    }
                },
                {
                    "trigger": {
                        "url-filter": "not-example.com"
                    },
                    "action": {
                        "type": "css",
                        "css": "#excluded-css:has(div) { height: 5px; }"
                    }
                }
            ]
        """;
        
        contentBlockerContainer.setJson(json: contentBlockerJsonString);
        let data: ContentBlockerContainer.BlockerData = contentBlockerContainer.getData(url: URL(fileURLWithPath:"http://example.com")) as! ContentBlockerContainer.BlockerData;
        
        XCTAssert(data.scripts == "included-script");
        XCTAssert(data.css == "");
    }
    
    func testUrlFilterIfDomain() {
        let contentBlockerJsonString = """
            [
                {
                    "trigger": {
                        "url-filter": "^[htpsw]+:\\/\\/",
                        "if-domain": [
                            "example.com"
                        ]
                    },
                    "action": {
                        "type": "script",
                        "script": "included-script"
                    }
                },
                {
                    "trigger": {
                        "url-filter": "^[htpsw]+:\\/\\/",
                        "if-domain": [
                            "not-example.com"
                        ]
                    },
                    "action": {
                        "type": "css",
                        "css": "#excluded-css:has(div) { height: 5px; }"
                    }
                }
            ]
        """;
        
        contentBlockerContainer.setJson(json: contentBlockerJsonString);
        let data: ContentBlockerContainer.BlockerData = contentBlockerContainer.getData(url: URL(fileURLWithPath:"http://example.com")) as! ContentBlockerContainer.BlockerData;
        
        XCTAssert(data.scripts == "included-script");
        XCTAssert(data.css == "");
    }
    
    func testUrlFilterUnlessDomain() {
        let contentBlockerJsonString = """
            [
                {
                    "trigger": {
                        "url-filter": ".*",
                        "unless-domain": [
                            "*example.com",
                            "*test.com"
                        ]
                    },
                    "action": {
                        "type": "script",
                        "script": "excluded-script"
                    }
                },
                {
                    "trigger": {
                        "url-filter": ".*"
                    },
                    "action": {
                        "type": "css",
                        "css": "#included-css:has(div) { height: 5px; }"
                    }
                }
            ]
        """;
        
        contentBlockerContainer.setJson(json: contentBlockerJsonString);
        let data: ContentBlockerContainer.BlockerData = contentBlockerContainer.getData(url: URL(fileURLWithPath:"http://example.com")) as! ContentBlockerContainer.BlockerData;
        
        XCTAssert(data.scripts == "");
        XCTAssert(data.css == "#included-css:has(div) { height: 5px; }");
    }
    
    func testPerformanceExample() {
        // TODO: Add performance test case.
        self.measure {
            // Put the code you want to measure the time of here.
        }
    }
    
}
