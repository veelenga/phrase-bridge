import gulp from "gulp";
import gulpZip from "gulp-zip";
import { deleteSync } from "del";
import { readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("./package.json"));
const { name, version } = packageJson;

const config = {
  dist: "dist",
  build: "build",
  packageName: `${name}-${version}.zip`,
  src: {
    js: "index.js",
    instructions: "instructions/**/*",
    packageJson: "package.json",
  },
};

function cleanDist(cb) {
  deleteSync([`${config.dist}/**`, config.dist]);
  cb();
}

function cleanBuild(cb) {
  deleteSync([`${config.build}/**`, config.build]);
  cb();
}

function createZip() {
  console.log(`Creating archive: ${config.packageName}`);
  return gulp
    .src(`${config.dist}/**/*`)
    .pipe(gulpZip(config.packageName))
    .pipe(gulp.dest(config.build));
}

export const clean = gulp.parallel(cleanDist, cleanBuild);
export const zip = gulp.series(cleanBuild, createZip);

export default zip;
