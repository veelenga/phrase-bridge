import gulp from "gulp";
import gulpZip from "gulp-zip";
import { deleteSync } from "del";
import path from "path";
import fs from "fs";

const config = {
  dist: "dist",
  build: "build",
  packageJson: JSON.parse(fs.readFileSync("./package.json")),
  get packageName() {
    return `${this.packageJson.name}-${this.packageJson.version}.zip`;
  },
};

function cleanBuild(cb) {
  deleteSync([`${config.build}/**`, config.build]);
  cb();
}

function createZip() {
  console.log(`Creating archive: ${config.packageName}`);
  return gulp
    .src([
      path.join(config.dist, "**", "*"),
      `!${path.join(config.dist, "node_modules/.bin/**")}`,
      `!${path.join(config.dist, "**/*.test.js")}`,
      `!${path.join(config.dist, "**/*.spec.js")}`,
      `!${path.join(config.dist, "**/__tests__/**")}`,
      `!${path.join(config.dist, "**/__mocks__/**")}`,
      `!${path.join(config.dist, "**/examples/**")}`,
    ])
    .pipe(gulpZip(config.packageName))
    .pipe(gulp.dest(config.build));
}

export const zip = gulp.series(cleanBuild, createZip);

export default zip;
