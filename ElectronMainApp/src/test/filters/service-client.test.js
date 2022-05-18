const path = require('path');

const serviceClient = require('../../main/app/filters/service-client');
const filtersMetadata = require('../resources/filtersMetadata.json');

const TEST_FILTERS_IDS = [4, 5, 6];
const testFiltersMetadata = filtersMetadata.filters.filter((filter) => TEST_FILTERS_IDS.includes(filter.filterId));

const testFilterPath = path.resolve(__dirname, '../resources', 'test-filter.txt');

jest.mock('../../main/app/app');

jest.spyOn(serviceClient, 'loadRemoteFiltersMetadata').mockImplementation((callback) => {
    callback(filtersMetadata);
});

jest.spyOn(serviceClient, 'loadFiltersMetadata').mockImplementation((TEST_FILTERS_IDS, callback) => {
    callback(testFiltersMetadata);
});

describe('Service client tests', () => {
    it('Download rules by path', async (done) => {
        serviceClient.loadFilterRulesBySubscriptionUrl(testFilterPath, (lines) => {
            expect(lines).toHaveLength(8);
            expect(lines[0]).toBe('! Title: Test custom filter');
            done();
        });
    });

    it('Load remote filters metadata', async (done) => {
        serviceClient.loadRemoteFiltersMetadata((metadata) => {
            expect(metadata).toHaveProperty('groups');
            expect(metadata.groups.length).toBeGreaterThan(5);
            expect(metadata).toHaveProperty('tags');
            expect(metadata.tags.length).toBeGreaterThan(50);
            expect(metadata).toHaveProperty('filters');
            expect(metadata.filters.length).toBeGreaterThan(50);
            done();
        });
    });

    it('Load filters metadata by id', async (done) => {
        serviceClient.loadFiltersMetadata(TEST_FILTERS_IDS, (metadata) => {
            expect(metadata).toHaveLength(3);
            expect(metadata[0].filterId).toBe(4);
            expect(metadata[0].name).toBe('AdGuard Social Media filter');
            expect(metadata[0].description).toBeDefined();
            expect(metadata[0].timeAdded).toBeDefined();
            expect(metadata[0].displayNumber).toBeDefined();
            expect(metadata[0].groupId).toBeDefined();
            expect(metadata[0].subscriptionUrl).toBeDefined();
            expect(metadata[0].trustLevel).toBeDefined();
            expect(metadata[0].version).toBeDefined();
            expect(metadata[0].timeUpdated).toBeDefined();
            expect(metadata[0].tags).toBeDefined();
            done();
        });
    });
});
