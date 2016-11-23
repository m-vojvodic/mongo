// This file tests that commands namespace parsing rejects embedded null bytes.
(function() {
    "use strict";

    const isMaster = db.runCommand("ismaster");
    assert.commandWorked(isMaster);
    const isMongos = (isMaster.msg === "isdbgrid");

    db.commands_namespace_parsing.drop();
    assert.writeOK(db.commands_namespace_parsing.insert({a: 1}));

    /**
     * Aggregation Commands
     */
    // Test aggregate fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({aggregate: "", pipeline: []}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({aggregate: "\0", pipeline: []}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({aggregate: "a\0b", pipeline: []}),
                                 ErrorCodes.InvalidNamespace);

    // Test count fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({count: ""}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({count: "\0"}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({count: "a\0b"}), ErrorCodes.InvalidNamespace);

    // Test distinct fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({distinct: "", key: "a"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({distinct: "\0", key: "a"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({distinct: "a\0b", key: "a"}),
                                 ErrorCodes.InvalidNamespace);

    // Test group fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({group: {ns: "", $reduce: () => {}, initial: {}}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({group: {ns: "\0", $reduce: () => {}, initial: {}}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({group: {ns: "a\0b", $reduce: () => {}, initial: {}}}),
        ErrorCodes.InvalidNamespace);

    // Test mapReduce fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({
        mapreduce: "",
        map: function() {
            emit(this.a, 1);
        },
        reduce: function(key, values) {
            return Array.sum(values);
        },
        out: "commands_namespace_parsing_out"
    }),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({
        mapreduce: "\0",
        map: function() {
            emit(this.a, 1);
        },
        reduce: function(key, values) {
            return Array.sum(values);
        },
        out: "commands_namespace_parsing_out"
    }),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({
        mapreduce: "a\0b",
        map: function() {
            emit(this.a, 1);
        },
        reduce: function(key, values) {
            return Array.sum(values);
        },
        out: "commands_namespace_parsing_out"
    }),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({
        mapreduce: "commands_namespace_parsing",
        map: function() {
            emit(this.a, 1);
        },
        reduce: function(key, values) {
            return Array.sum(values);
        },
        out: ""
    }),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({
        mapreduce: "commands_namespace_parsing",
        map: function() {
            emit(this.a, 1);
        },
        reduce: function(key, values) {
            return Array.sum(values);
        },
        out: "\0"
    }),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({
        mapreduce: "commands_namespace_parsing",
        map: function() {
            emit(this.a, 1);
        },
        reduce: function(key, values) {
            return Array.sum(values);
        },
        out: "a\0b"
    }),
                                 ErrorCodes.InvalidNamespace);

    /**
     * Geospatial Commands
     */
    // Test geoNear fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({geoNear: "", near: [0.000000, 0.000000]}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({geoNear: "\0", near: [0.000000, 0.000000]}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({geoNear: "a\0b", near: [0.000000, 0.000000]}),
                                 ErrorCodes.InvalidNamespace);

    if (!isMongos) {
        // Test geoSearch fails with an invalid collection name.
        assert.commandFailedWithCode(
            db.runCommand({geoSearch: "", search: {}, near: [0.000000, 0.000000], maxDistance: 10}),
            ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(
            db.runCommand(
                {geoSearch: "\0", search: {}, near: [0.000000, 0.000000], maxDistance: 10}),
            ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(
            db.runCommand(
                {geoSearch: "a\0b", search: {}, near: [0.000000, 0.000000], maxDistance: 10}),
            ErrorCodes.InvalidNamespace);
    }

    // Query and Write Operation Commands
    // Test find fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({find: ""}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({find: "\0"}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({find: "a\0b"}), ErrorCodes.InvalidNamespace);

    // Test insert fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({insert: "", documents: [{q: {a: 1}, u: {a: 2}}]}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({insert: "\0", documents: [{q: {a: 1}, u: {a: 2}}]}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({insert: "a\0b", documents: [{q: {a: 1}, u: {a: 2}}]}),
        ErrorCodes.InvalidNamespace);

    // Test update fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({update: "", updates: [{q: {a: 1}, u: {a: 2}}]}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({update: "\0", updates: [{q: {a: 1}, u: {a: 2}}]}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({update: "a\0b", updates: [{q: {a: 1}, u: {a: 2}}]}),
                                 ErrorCodes.InvalidNamespace);

    // Test delete fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({delete: "", deletes: [{q: {a: 1}, limit: 1}]}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({delete: "\0", deletes: [{q: {a: 1}, limit: 1}]}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({delete: "a\0b", deletes: [{q: {a: 1}, limit: 1}]}),
                                 ErrorCodes.InvalidNamespace);

    // Test findAndModify fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({findAndModify: "", update: {a: 2}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({findAndModify: "\0", update: {a: 2}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({findAndModify: "a\0b", update: {a: 2}}),
                                 ErrorCodes.InvalidNamespace);

    // Test getMore fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({getMore: NumberLong("123456"), collection: ""}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({getMore: NumberLong("123456"), collection: "\0"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({getMore: NumberLong("123456"), collection: "a\0b"}),
                                 ErrorCodes.InvalidNamespace);

    if (!isMongos) {
        // Test parallelCollectionScan fails with an invalid collection name.
        assert.commandFailedWithCode(db.runCommand({parallelCollectionScan: "", numCursors: 10}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.runCommand({parallelCollectionScan: "\0", numCursors: 10}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(
            db.runCommand({parallelCollectionScan: "a\0b", numCursors: 10}),
            ErrorCodes.InvalidNamespace);

        // Test godinsert fails with an invalid collection name.
        assert.commandFailedWithCode(db.runCommand({godinsert: "", obj: {_id: 1}}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.runCommand({godinsert: "\0", obj: {_id: 1}}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.runCommand({godinsert: "a\0b", obj: {_id: 1}}),
                                     ErrorCodes.InvalidNamespace);
    }

    /**
     * Query Plan Cache Commands
     */
    // Test planCacheListFilters fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({planCacheListFilters: ""}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({planCacheListFilters: "\0"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({planCacheListFilters: "a\0b"}),
                                 ErrorCodes.InvalidNamespace);

    // Test planCacheSetFilter fails with an invalid collection name.
    assert.commandFailedWithCode(
        db.runCommand({planCacheSetFilter: "", query: {}, indexes: [{a: 1}]}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({planCacheSetFilter: "\0", query: {}, indexes: [{a: 1}]}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({planCacheSetFilter: "a\0b", query: {}, indexes: [{a: 1}]}),
        ErrorCodes.InvalidNamespace);

    // Test planCacheClearFilters fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({planCacheClearFilters: ""}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({planCacheClearFilters: "\0"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({planCacheClearFilters: "a\0b"}),
                                 ErrorCodes.InvalidNamespace);

    // Test planCacheListQueryShapes fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({planCacheListQueryShapes: ""}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({planCacheListQueryShapes: "\0"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({planCacheListQueryShapes: "a\0b"}),
                                 ErrorCodes.InvalidNamespace);

    // Test planCacheListPlans fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({planCacheListPlans: "", query: {}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({planCacheListPlans: "\0", query: {}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({planCacheListPlans: "a\0b", query: {}}),
                                 ErrorCodes.InvalidNamespace);

    // Test planCacheClear fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({planCacheClear: ""}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({planCacheClear: "\0"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({planCacheClear: "a\0b"}),
                                 ErrorCodes.InvalidNamespace);

    /**
     * Sharding Commands
     */
    if (!isMongos) {
        // Test cleanupOrphaned fails with an invalid collection name.
        assert.commandFailedWithCode(db.adminCommand({cleanupOrphaned: ""}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.adminCommand({cleanupOrphaned: "\0"}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.adminCommand({cleanupOrphaned: "a\0b"}),
                                     ErrorCodes.InvalidNamespace);
    }

    if (isMongos) {
        // Test enableSharding fails with an invalid collection name.
        assert.commandFailedWithCode(db.adminCommand({enableSharding: ""}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.adminCommand({enableSharding: "\0"}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.adminCommand({enableSharding: "a\0b"}),
                                     ErrorCodes.InvalidNamespace);

        // Test mergeChunks fails with an invalid collection name.
        assert.commandFailedWithCode(
            db.adminCommand({mergeChunks: "", bounds: [{_id: MinKey()}, {_id: MaxKey()}]}),
            ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(
            db.adminCommand({mergeChunks: "\0", bounds: [{_id: MinKey()}, {_id: MaxKey()}]}),
            ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(
            db.adminCommand({mergeChunks: "a\0b", bounds: [{_id: MinKey()}, {_id: MaxKey()}]}),
            ErrorCodes.InvalidNamespace);

        // Test shardCollection fails with an invalid collection name.
        assert.commandFailedWithCode(db.adminCommand({shardCollection: "", key: {_id: 1}}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.adminCommand({shardCollection: "\0", key: {_id: 1}}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.adminCommand({shardCollection: "a\0.b", key: {_id: 1}}),
                                     ErrorCodes.InvalidNamespace);

        // Test split fails with an invalid collection name.
        assert.commandFailedWithCode(db.adminCommand({split: "", find: {}}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.adminCommand({split: "\0", find: {}}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.adminCommand({split: "a\0.b", find: {}}),
                                     ErrorCodes.InvalidNamespace);

        // Test moveChunk fails with an invalid collection name.
        assert.commandFailedWithCode(db.adminCommand({shardCollection: "", key: {_id: 1}}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.adminCommand({shardCollection: "\0", key: {_id: 1}}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.adminCommand({shardCollection: "a\0.b", key: {_id: 1}}),
                                     ErrorCodes.InvalidNamespace);

        // Test movePrimary fails with an invalid collection name.
        assert.commandFailed(db.adminCommand({movePrimary: ""}));
        assert.commandFailed(db.adminCommand({movePrimary: "\0"}));
        assert.commandFailed(db.adminCommand({movePrimary: "a\0b"}));
    }

    /**
     * Instance Administration Commands
     */
    // Test renameCollection fails with an invalid collection name.
    assert.commandFailedWithCode(db.adminCommand({renameCollection: "", to: "test.b"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.adminCommand({renameCollection: "\0", to: "test.b"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.adminCommand({renameCollection: "a\0b", to: "test.b"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.adminCommand({renameCollection: "test.b", to: ""}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.adminCommand({renameCollection: "test.b", to: "\0"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.adminCommand({renameCollection: "test.b", to: "test.a\0b"}),
                                 ErrorCodes.InvalidNamespace);

    // Test copydb fails with an invalid collection name.
    assert.commandFailedWithCode(db.adminCommand({copydb: 1, fromdb: "", todb: "b"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.adminCommand({copydb: 1, fromdb: "\0", todb: "b"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.adminCommand({copydb: 1, fromdb: "a\0b", todb: "b"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.adminCommand({copydb: 1, fromdb: "a", todb: ""}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.adminCommand({copydb: 1, fromdb: "a", todb: "\0"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.adminCommand({copydb: 1, fromdb: "a", todb: "b\0a"}),
                                 ErrorCodes.InvalidNamespace);

    // Test drop fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({drop: ""}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({drop: "\0"}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({drop: "a\0b"}), ErrorCodes.InvalidNamespace);

    // Test create fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({create: ""}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({create: "\0"}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({create: "a\0b"}), ErrorCodes.InvalidNamespace);
    if (!isMongos) {
        // Test cloneCollection fails with an invalid collection name.
        assert.commandFailedWithCode(db.runCommand({cloneCollection: "", from: "fakehost"}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.runCommand({cloneCollection: "\0", from: "fakehost"}),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.runCommand({cloneCollection: "a\0b", from: "fakehost"}),
                                     ErrorCodes.InvalidNamespace);

        // Test cloneCollectionAsCapped fails with an invalid collection name.
        assert.commandFailedWithCode(
            db.runCommand({cloneCollectionAsCapped: "", toCollection: "b", size: 1024}),
            ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(
            db.runCommand({cloneCollectionAsCapped: "\0", toCollection: "b", size: 1024}),
            ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(
            db.runCommand({cloneCollectionAsCapped: "a\0b", toCollection: "b", size: 1024}),
            ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.runCommand({
            cloneCollectionAsCapped: "commands_namespace_parsing",
            toCollection: "",
            size: 1024
        }),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.runCommand({
            cloneCollectionAsCapped: "commands_namespace_parsing",
            toCollection: "\0",
            size: 1024
        }),
                                     ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.runCommand({
            cloneCollectionAsCapped: "commands_namespace_parsing",
            toCollection: "b\0a",
            size: 1024
        }),
                                     ErrorCodes.InvalidNamespace);
    }

    // Test convertToCapped fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({convertToCapped: "", size: 1024}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({convertToCapped: "\0", size: 1024}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({convertToCapped: "a\0b", size: 1024}),
                                 ErrorCodes.InvalidNamespace);

    // Test filemd5 fails with an invalid collection name.
    // OK to pass 'root: ""'
    assert.commandFailedWithCode(db.runCommand({filemd5: ObjectId(), root: "\0"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({filemd5: ObjectId(), root: "a\0b"}),
                                 ErrorCodes.InvalidNamespace);

    // Test createIndexes fails with an invalid collection name.
    assert.commandFailedWithCode(
        db.runCommand({createIndexes: "", indexes: [{key: {a: 1}, name: "a1"}]}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({createIndexes: "\0", indexes: [{key: {a: 1}, name: "a1"}]}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({createIndexes: "a\0b", indexes: [{key: {a: 1}, name: "a1"}]}),
        ErrorCodes.InvalidNamespace);

    // Test listIndexes fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({listIndexes: ""}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({listIndexes: "\0"}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({listIndexes: "a\0b"}), ErrorCodes.InvalidNamespace);

    // Test dropIndexes fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({dropIndexes: "", index: "*"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({dropIndexes: "\0", index: "*"}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({dropIndexes: "a\0b", index: "*"}),
                                 ErrorCodes.InvalidNamespace);

    if (!isMongos) {
        // Test compact fails with an invalid collection name.
        assert.commandFailedWithCode(db.runCommand({compact: ""}), ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.runCommand({compact: "\0"}), ErrorCodes.InvalidNamespace);
        assert.commandFailedWithCode(db.runCommand({compact: "a\0b"}), ErrorCodes.InvalidNamespace);
    }

    // Test collMod fails with an invalid collection name.
    assert.commandFailedWithCode(
        db.runCommand({collMod: "", index: {keyPattern: {a: 1}, expireAfterSeconds: 60}}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({collMod: "\0", index: {keyPattern: {a: 1}, expireAfterSeconds: 60}}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({collMod: "a\0b", index: {keyPattern: {a: 1}, expireAfterSeconds: 60}}),
        ErrorCodes.InvalidNamespace);

    // Test reIndex fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({reIndex: ""}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({reIndex: "\0"}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({reIndex: "a\0b"}), ErrorCodes.InvalidNamespace);

    /**
     * Diagnostic Commands
     */
    // Test collStats fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({collStats: ""}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({collStats: "\0"}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({collStats: "a\0b"}), ErrorCodes.InvalidNamespace);

    // Test dataSize fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({dataSize: ""}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({dataSize: "\0"}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({dataSize: "a\0.b"}), ErrorCodes.InvalidNamespace);

    // Test explain of aggregate fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({aggregate: "", pipeline: [], explain: true}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({aggregate: "\0", pipeline: [], explain: true}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({aggregate: "a\0b", pipeline: [], explain: true}),
                                 ErrorCodes.InvalidNamespace);

    // Test explain of count fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({explain: {count: ""}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({explain: {count: "\0"}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({explain: {count: "a\0b"}}),
                                 ErrorCodes.InvalidNamespace);

    // Test explain of distinct fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({explain: {distinct: "", key: "a"}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({explain: {distinct: "\0", key: "a"}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({explain: {distinct: "a\0b", key: "a"}}),
                                 ErrorCodes.InvalidNamespace);

    // Test explain of group fails with an invalid collection name.
    assert.commandFailed(
        db.runCommand({explain: {group: {ns: "", $reduce: () => {}, initial: {}}}}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailed(
        db.runCommand({explain: {group: {ns: "\0", $reduce: () => {}, initial: {}}}}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailed(
        db.runCommand({explain: {group: {ns: "a\0b", $reduce: () => {}, initial: {}}}}),
        ErrorCodes.InvalidNamespace);

    // Test explain of find fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({explain: {find: ""}}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({explain: {find: "\0"}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({explain: {find: "a\0b"}}),
                                 ErrorCodes.InvalidNamespace);

    // Test explain of findAndModify fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({explain: {findAndModify: "", update: {a: 2}}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({explain: {findAndModify: "\0", update: {a: 2}}}),
                                 ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({explain: {findAndModify: "a\0b", update: {a: 2}}}),
                                 ErrorCodes.InvalidNamespace);

    // Test explain of delete fails with an invalid collection name.
    assert.commandFailedWithCode(
        db.runCommand({explain: {delete: "", deletes: [{q: {a: 1}, limit: 1}]}}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({explain: {delete: "\0", deletes: [{q: {a: 1}, limit: 1}]}}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({explain: {delete: "a\0b", deletes: [{q: {a: 1}, limit: 1}]}}),
        ErrorCodes.InvalidNamespace);

    // Test explain of update fails with an invalid collection name.
    assert.commandFailedWithCode(
        db.runCommand({explain: {update: "", updates: [{q: {a: 1}, u: {a: 2}}]}}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({explain: {update: "\0", updates: [{q: {a: 1}, u: {a: 2}}]}}),
        ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(
        db.runCommand({explain: {update: "a\0b", updates: [{q: {a: 1}, u: {a: 2}}]}}),
        ErrorCodes.InvalidNamespace);

    // Test validate fails with an invalid collection name.
    assert.commandFailedWithCode(db.runCommand({validate: ""}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({validate: "\0"}), ErrorCodes.InvalidNamespace);
    assert.commandFailedWithCode(db.runCommand({validate: "a\0b"}), ErrorCodes.InvalidNamespace);
})();
