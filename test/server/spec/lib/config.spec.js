"use strict";

const config = require("../../../../lib/config");
const base = require("../base.spec");

const minimalCfg = [];
const toJson = (code) => JSON.stringify(code);
const toJs = (code) => `module.exports = ${JSON.stringify(code)};`;

describe("lib/config", () => {

  describe("#_normalizeConfig", () => {
    const norm = config._normalizeConfig;

    it("handles empty cases", () => {
      expect(norm()).to.eql([]);
      expect(norm(null)).to.eql([]);
      expect(norm([])).to.eql([]);
      expect(norm({})).to.eql([]);
    });

    it("converts strings to config object", () => {
      expect(norm(["one"])) .to.eql([
        { module: "one", tags: [] }
      ]);
      expect(norm(["one", "two"])) .to.eql([
        { module: "one", tags: [] },
        { module: "two", tags: [] }
      ]);
      expect(norm(["one", "two", "three"])) .to.eql([
        { module: "one", tags: [] },
        { module: "two", tags: [] },
        { module: "three", tags: [] }
      ]);
    });

    it("converts object shorthand to config object", () => {
      expect(norm({ one: {} })) .to.eql([
        { module: "one", tags: [] }
      ]);
      expect(norm({ one: {}, two: { tags: ["foo"] } })) .to.eql([
        { module: "one", tags: [] },
        { module: "two", tags: ["foo"] }
      ]);
      expect(norm({
        one: {},
        two: { tags: ["foo"] },
        three: { tags: ["foo", "bar"] }
      })).to.eql([
        { module: "one", tags: [] },
        { module: "two", tags: ["foo"] },
        { module: "three", tags: ["foo", "bar"] }
      ]);
    });

    it("converts array of objects to config object", () => {
      expect(norm([{ module: "one" }])) .to.eql([
        { module: "one", tags: [] }
      ]);
      expect(norm([{ module: "one" }, { module: "two", tags: ["foo"] }])) .to.eql([
        { module: "one", tags: [] },
        { module: "two", tags: ["foo"] }
      ]);
      expect(norm([
        { module: "one" },
        { module: "two", tags: ["foo"] },
        { module: "three", tags: ["foo", "bar"] }
      ])).to.eql([
        { module: "one", tags: [] },
        { module: "two", tags: ["foo"] },
        { module: "three", tags: ["foo", "bar"] }
      ]);
    });
  });

  describe("#getConfig", () => {

    it("errors on missing RC file", () => {
      return config.getConfig()
        .catch((err) => {
          expect(err).to.have.property("message").that.contains("configuration data");
        });
    });

    it("resolves PWD/lankrc.js", () => {
      base.mockFs({
        ".lankrc.js": toJs(minimalCfg)
      });

      return config.getConfig();
    });

    it("resolves PWD/lankrc.json", () => {
      base.mockFs({
        ".lankrc.json": toJson(minimalCfg)
      });

      return config.getConfig();
    });

    it("resolves ../PWD/lankrc.js", () => {
      base.mockFs({
        "../.lankrc.js": toJs(minimalCfg)
      });

      return config.getConfig();
    });

    it("resolves ../PWD/lankrc.json", () => {
      base.mockFs({
        "../.lankrc.json": toJson(minimalCfg)
      });

      return config.getConfig();
    });

    it("chooses PWD/lankrc.js over ../PWD/lankrc.js", () => {
      base.mockFs({
        ".lankrc.js": toJs({ pwd: {} }),
        "../.lankrc.js": toJs({ belowPwd: {} })
      });

      return config.getConfig()
        .then((cfg) => {
          expect(cfg).to.eql([{ module: "pwd", tags: [] }]);
        });
    });

    it("errors on non-Array lankrc", () => {
      base.mockFs({
        ".lankrc.js": toJs({})
      });

      return config.getConfig()
        .catch((err) => {
          expect(err).to.have.property("message").that.contains("must be an array");
        });
    });

  });

});
