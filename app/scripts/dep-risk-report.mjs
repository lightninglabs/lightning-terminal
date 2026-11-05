// Reports the supply-chain risks in a pull request's dependency changes, so a reviewer can
// see them without reading the `yarn.lock` diff line by line.
//
// It compares the lockfile against a base git ref and, for every package version the
// change introduces, looks the version up in the public npm registry. It never installs or
// runs package code, so it is safe to run on any pull request. It flags:
//
// - blocking: a package resolved from outside the npm registry, a missing integrity hash,
//   an integrity hash that does not match the registry's, or a version the registry does
//   not have. Any of these makes the script exit with status 1.
// - high: a release under 7 days old, an install script that was added or changed, a new
//   package name, a dropped npm provenance attestation, a package that was published from
//   CI and is now published by hand, and a major bump of a direct dependency.
// - medium: a release under 14 days old, a new publisher, and new maintainers.
//
// Malicious releases are usually found and pulled within days, and usually run their
// payload from an install script, which is why age and install scripts rank high.
//
// Usage, from the repository root:
//   node app/scripts/dep-risk-report.mjs --base <git-ref> --lockfile app/yarn.lock
//     [--head <git-ref>] [--format md|json] [--recent-days 7] [--watch-days 14]
//     [--now <ISO date>]
//
// Without `--head` it reads the lockfile in the working tree. `--now` measures release ages
// from another date, for replaying an old change. Exit status 2 means the script itself
// failed, for example because the registry could not be reached.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/** The registry every package is looked up in. */
const REGISTRY = 'https://registry.npmjs.org';
/** The hosts a lockfile entry may be downloaded from. Both serve the npm registry. */
const ALLOWED_HOSTS = new Set(['registry.yarnpkg.com', 'registry.npmjs.org']);
/** The lifecycle scripts that npm and yarn run when a package is installed. */
const INSTALL_HOOKS = ['preinstall', 'install', 'postinstall'];
/** One day in milliseconds. */
const DAY = 24 * 60 * 60 * 1000;
/** The order flags are listed in, most severe first. */
const SEVERITY_ORDER = { blocking: 0, high: 1, medium: 2, info: 3 };

/**
 * Reads the command-line options, filling in the defaults.
 * @param {string[]} argv the arguments after the script path
 */
function parseArgs(argv) {
  const opts = { lockfile: 'yarn.lock', format: 'md', recentDays: 7, watchDays: 14 };
  for (let i = 0; i < argv.length; i += 2) {
    const [key, val] = [argv[i], argv[i + 1]];
    if (key === '--base') opts.base = val;
    else if (key === '--head') opts.head = val;
    else if (key === '--now') opts.now = Date.parse(val);
    else if (key === '--lockfile') opts.lockfile = val;
    else if (key === '--format') opts.format = val;
    else if (key === '--recent-days') opts.recentDays = Number(val);
    else if (key === '--watch-days') opts.watchDays = Number(val);
    else throw new Error(`unknown argument ${key}`);
  }
  if (!opts.base) throw new Error('--base <git-ref> is required');
  if (Number.isNaN(opts.now)) throw new Error('--now must be an ISO date');
  return opts;
}

/**
 * Returns the package name from one lockfile spec such as `"@scope/name@^1.2.0"`. For an
 * alias such as `string-width-cjs@npm:string-width@^4.2.0`, it returns the real package.
 * @param {string} spec
 */
function specName(spec) {
  let name = spec.trim().replace(/^"|"$/g, '');
  const alias = name.indexOf('@npm:');
  if (alias > 0) name = name.slice(alias + 5);
  const at = name.lastIndexOf('@');
  return at > 0 ? name.slice(0, at) : name;
}

/**
 * Parses a yarn v1 lockfile into one entry per block, each with the package name, the
 * block's header line, its version, resolved URL, integrity hash, and the names it
 * depends on.
 * @param {string} text
 */
function parseLockfile(text) {
  const entries = [];
  let cur;
  for (const line of text.split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    if (!line.startsWith(' ')) {
      const header = line.replace(/:$/, '');
      cur = { name: specName(header.split(',')[0]), header, deps: [] };
      entries.push(cur);
      continue;
    }
    const field = line.match(/^ {2}(version|resolved|integrity) "?([^"]*)"?$/);
    if (field && cur) cur[field[1]] = field[2];
    const dep = line.match(/^ {4}"?([^"\s]+)"? /);
    if (dep && cur) cur.deps.push(dep[1]);
  }
  return entries;
}

/**
 * Returns the names the project depends on directly.
 * @param {string} pkgText the contents of the package.json next to the lockfile
 */
function directDeps(pkgText) {
  const pkg = JSON.parse(pkgText);
  const fields = ['dependencies', 'devDependencies', 'optionalDependencies'];
  return new Set(fields.flatMap(field => Object.keys(pkg[field] ?? {})));
}

/**
 * Returns `name@version` for a lockfile entry.
 * @param {{ name: string, version: string }} entry
 */
function versionKey(entry) {
  return `${entry.name}@${entry.version}`;
}

/**
 * Compares two versions by major, minor, and patch. Prerelease tags are ignored, which is
 * close enough for picking the version an update replaced.
 * @param {string} a
 * @param {string} b
 */
function cmpSemver(a, b) {
  const pa = a.split(/[.+-]/).map(Number);
  const pb = b.split(/[.+-]/).map(Number);
  for (let i = 0; i < 3; i++) {
    const [x, y] = [pa[i] || 0, pb[i] || 0];
    if (x !== y) return x > y ? 1 : -1;
  }
  return 0;
}

/**
 * Picks the base version a new version most likely replaced: the highest lower version, or
 * the lowest version when every base version is higher, as in a downgrade.
 * @param {Set<string>} baseVersions the versions of the same package in the base lockfile
 * @param {string} version
 */
function previousVersion(baseVersions, version) {
  const sorted = [...baseVersions].sort(cmpSemver);
  const lower = sorted.filter(v => cmpSemver(v, version) < 0);
  return lower.length ? lower[lower.length - 1] : sorted[0];
}

/** Registry documents by package name, so each package is fetched once. */
const packuments = new Map();

/**
 * Fetches a package's full registry document, which holds every version's manifest and
 * publish time.
 * @param {string} name
 */
function packument(name) {
  if (!packuments.has(name)) {
    const request = fetch(`${REGISTRY}/${name.replace('/', '%2F')}`).then(res => {
      if (!res.ok) throw new Error(`registry returned ${res.status} for ${name}`);
      return res.json();
    });
    packuments.set(name, request);
  }
  return packuments.get(name);
}

/**
 * Maps `items` through the async `fn`, running at most `limit` calls at a time so the
 * registry is not flooded.
 * @param {unknown[]} items
 * @param {number} limit
 * @param {(item: any) => Promise<any>} fn
 */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: limit }, worker));
  return out;
}

/**
 * Returns the install scripts a version runs, by hook name.
 * @param {object | undefined} manifest the version's registry manifest
 */
function installHooks(manifest) {
  const hooks = {};
  for (const hook of INSTALL_HOOKS) {
    if (manifest?.scripts?.[hook]) hooks[hook] = manifest.scripts[hook];
  }
  // A package with a binding.gyp file runs node-gyp on install even without a script.
  if (manifest?.gypfile && !hooks.install) hooks.install = '(implicit node-gyp rebuild)';
  return hooks;
}

/**
 * Returns the sorted npm usernames of a version's maintainers.
 * @param {object | undefined} manifest
 */
function maintainerNames(manifest) {
  return (manifest?.maintainers ?? []).map(m => m.name ?? m).sort();
}

/**
 * Whether the version has an npm provenance attestation, which ties the tarball to the
 * public CI run that built it.
 * @param {object | undefined} manifest
 */
function hasProvenance(manifest) {
  return Boolean(manifest?.dist?.attestations);
}

/**
 * Whether the version was published from CI. npm records a trusted (OIDC) publish as
 * published by "GitHub Actions".
 * @param {object | undefined} manifest
 */
function trustedPublish(manifest) {
  return manifest?._npmUser?.name === 'GitHub Actions' || hasProvenance(manifest);
}

/**
 * Returns the problems with where a lockfile entry is downloaded from.
 * @param {{ name: string, version: string, resolved?: string, integrity?: string }} entry
 */
function checkSource(entry) {
  const problems = [];
  if (!entry.integrity) problems.push('no integrity hash');
  if (!entry.resolved) {
    problems.push('no resolved URL (git, file or link dependency)');
    return problems;
  }
  let url;
  try {
    url = new URL(entry.resolved);
  } catch {
    problems.push(`unparseable resolved URL ${entry.resolved}`);
    return problems;
  }
  if (url.protocol !== 'https:' || !ALLOWED_HOSTS.has(url.hostname)) {
    problems.push(`resolved from ${url.protocol}//${url.hostname}, not the npm registry`);
  }
  const tarball = `${entry.name.split('/').pop()}-${entry.version}.tgz`;
  if (!url.pathname.endsWith(`/${tarball}`)) {
    problems.push(`resolved tarball does not match ${entry.name}@${entry.version}`);
  }
  return problems;
}

/**
 * Looks one new lockfile entry up in the registry and returns what changed and every flag
 * it raises, each as `[severity, kind, detail]`.
 * @param {object} entry the lockfile entry
 * @param {string | undefined} prev the base version it replaced
 * @param {{ isNewName: boolean, isDirect: boolean, parents: string[],
 *   sourceChanged: boolean }} ctx
 * @param {object} opts the command-line options
 * @param {number} now the time release ages are measured from
 */
async function analyze(entry, prev, ctx, opts, now) {
  const flags = [];
  const blocking = checkSource(entry);
  const info = {
    name: entry.name,
    from: prev,
    to: entry.version,
    direct: ctx.isDirect,
    sourceChanged: ctx.sourceChanged,
  };

  if (ctx.isNewName) {
    const via = ctx.parents.length
      ? `pulled in by ${ctx.parents.join(', ')}`
      : 'no parent found in the lockfile';
    const kind = ctx.isDirect ? 'new direct dependency' : 'new transitive package';
    flags.push(['high', kind, via]);
  }

  let doc;
  try {
    doc = await packument(entry.name);
  } catch (error) {
    blocking.push(error.message);
  }
  const manifest = doc?.versions?.[entry.version];
  const prevManifest = prev ? doc?.versions?.[prev] : undefined;
  if (doc && !manifest) blocking.push('version not found in the npm registry');

  if (manifest) {
    // Old packages may only have a sha1 hash in the lockfile, which the registry's sha512
    // hash cannot be compared against.
    const regIntegrity = manifest.dist?.integrity;
    if (
      entry.integrity?.startsWith('sha512-') &&
      regIntegrity?.startsWith('sha512-') &&
      entry.integrity !== regIntegrity
    ) {
      blocking.push('lockfile integrity does not match the registry');
    }

    const published = doc.time?.[entry.version];
    info.published = published ? published.slice(0, 10) : 'unknown';
    if (published) {
      const ageDays = Math.floor((now - Date.parse(published)) / DAY);
      const detail = `published ${ageDays}d ago (${info.published})`;
      if (ageDays < opts.recentDays) flags.push(['high', 'very recent release', detail]);
      else if (ageDays < opts.watchDays) flags.push(['medium', 'recent release', detail]);
    }

    const hooks = installHooks(manifest);
    const prevHooks = installHooks(prevManifest);
    info.installScripts = Object.keys(hooks);
    for (const [hook, cmd] of Object.entries(hooks)) {
      if (!(hook in prevHooks)) {
        flags.push(['high', 'install script added', `${hook}: ${cmd}`]);
      } else if (prevHooks[hook] !== cmd) {
        const detail = `${hook}: ${prevHooks[hook]} → ${cmd}`;
        flags.push(['high', 'install script changed', detail]);
      }
    }

    if (prevManifest) {
      const pub = manifest._npmUser?.name;
      const prevPub = prevManifest._npmUser?.name;
      if (trustedPublish(prevManifest) && !trustedPublish(manifest)) {
        // A package that publishes from CI suddenly being published by hand is what a
        // stolen npm token looks like.
        const detail = `${prev} was published from CI, ${entry.version} by ${
          pub ?? 'unknown'
        }`;
        flags.push(['high', 'trusted publishing dropped', detail]);
      } else if (pub && prevPub && pub !== prevPub && !trustedPublish(manifest)) {
        flags.push(['medium', 'publisher changed', `${prevPub} → ${pub}`]);
      }
      const prevMaintainers = maintainerNames(prevManifest);
      const added = maintainerNames(manifest).filter(m => !prevMaintainers.includes(m));
      if (added.length) flags.push(['medium', 'maintainers added', added.join(', ')]);
      if (hasProvenance(prevManifest) && !hasProvenance(manifest)) {
        const detail = `${prev} had an npm provenance attestation, ${entry.version} does not`;
        flags.push(['high', 'provenance dropped', detail]);
      }
      if (Number(entry.version.split('.')[0]) > Number(prev.split('.')[0])) {
        const detail = `${prev} → ${entry.version}`;
        flags.push(
          ctx.isDirect
            ? ['high', 'major bump of a direct dependency', detail]
            : ['info', 'transitive major jump', detail],
        );
      }
    }

    if (manifest.deprecated)
      flags.push(['info', 'deprecated', String(manifest.deprecated)]);
  }

  for (const problem of blocking) flags.unshift(['blocking', 'lockfile source', problem]);
  return { ...info, flags };
}

/**
 * Describes a version change for the report, such as `1.2.0 → 1.3.0`.
 * @param {object} result one entry returned by `analyze`
 */
function changeLabel(result) {
  if (result.sourceChanged) return `${result.to} (source changed)`;
  return result.from ? `${result.from} → ${result.to}` : `(new) ${result.to}`;
}

/**
 * Makes a value safe to put in a markdown table cell. Registry fields such as script
 * commands are written by package authors, so pipes and newlines are escaped and long
 * values cut short.
 * @param {unknown} value
 */
function cell(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/[\r\n]+/g, ' ')
    .slice(0, 200);
}

/**
 * Renders the report as markdown: the flags table, then every version change in a
 * collapsed table.
 * @param {object[]} results the entries returned by `analyze`
 * @param {number} removed how many package versions the change removed
 * @param {object} opts the command-line options
 */
function toMarkdown(results, removed, opts) {
  const flagged = results
    .flatMap(r => r.flags.map(([sev, kind, detail]) => ({ sev, kind, detail, r })))
    .sort(
      (a, b) =>
        SEVERITY_ORDER[a.sev] - SEVERITY_ORDER[b.sev] || a.r.name.localeCompare(b.r.name),
    );
  const lines = [
    '### Risk flags',
    '',
    `Generated by \`dep-risk-report\` from the \`${opts.lockfile}\` diff against ` +
      `\`${opts.base}\`. ${results.length} new package versions, ${removed} removed, ` +
      `${flagged.length} flags. "Very recent" is under ${opts.recentDays} days old, ` +
      `"recent" is under ${opts.watchDays}.`,
    '',
  ];
  if (!flagged.length) {
    lines.push('No risk flags.');
  } else {
    lines.push('| Severity | Package | Change | Flag | Detail |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const f of flagged) {
      const row = [f.sev, `\`${cell(f.r.name)}\``, cell(changeLabel(f.r)), f.kind];
      lines.push(`| ${row.join(' | ')} | ${cell(f.detail)} |`);
    }
  }
  if (!results.length) return lines.join('\n');
  lines.push('', '<details><summary>All package version changes</summary>', '');
  lines.push('| Package | Change | Direct | Published | Install scripts |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const r of [...results].sort((a, b) => a.name.localeCompare(b.name))) {
    const scripts = r.installScripts?.length ? r.installScripts.join(', ') : 'none';
    const row = [`\`${cell(r.name)}\``, cell(changeLabel(r)), r.direct ? 'yes' : 'no'];
    lines.push(`| ${row.join(' | ')} | ${r.published ?? 'unknown'} | ${scripts} |`);
  }
  lines.push('', '</details>');
  return lines.join('\n');
}

/** Builds the report and exits with status 1 when it found a blocking problem. */
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const show = (ref, path) =>
    execFileSync('git', ['show', `${ref}:${path}`], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
  const read = path => (opts.head ? show(opts.head, path) : readFileSync(path, 'utf8'));
  const pkgPath = opts.lockfile.replace(/yarn\.lock$/, 'package.json');
  const head = parseLockfile(read(opts.lockfile));
  const base = parseLockfile(show(opts.base, opts.lockfile));
  const direct = directDeps(read(pkgPath));

  const baseVersions = new Map();
  for (const entry of base) {
    if (!baseVersions.has(entry.name)) baseVersions.set(entry.name, new Set());
    baseVersions.get(entry.name).add(entry.version);
  }
  const headKeys = new Set(head.map(versionKey));
  const removed = new Set(base.map(versionKey).filter(key => !headKeys.has(key))).size;

  // Check every new name@version, and every entry whose download URL or hash changed even
  // though its version did not, since that is how a tampered lockfile would look.
  const baseSources = new Map(base.map(e => [e.header, `${e.resolved}|${e.integrity}`]));
  const todo = new Map();
  for (const entry of head) {
    const isNewVersion = !baseVersions.get(entry.name)?.has(entry.version);
    const source = `${entry.resolved}|${entry.integrity}`;
    const sourceChanged =
      baseSources.has(entry.header) && baseSources.get(entry.header) !== source;
    if (isNewVersion || sourceChanged) todo.set(versionKey(entry), entry);
  }

  const parentsOf = new Map();
  for (const entry of head) {
    for (const dep of entry.deps) {
      if (!parentsOf.has(dep)) parentsOf.set(dep, new Set());
      parentsOf.get(dep).add(versionKey(entry));
    }
  }

  const now = opts.now ?? Date.now();
  const results = await mapLimit([...todo.values()], 8, entry => {
    const prevSet = baseVersions.get(entry.name);
    const sourceChanged = Boolean(prevSet?.has(entry.version));
    const prev =
      prevSet && !sourceChanged ? previousVersion(prevSet, entry.version) : undefined;
    const ctx = {
      isNewName: !prevSet,
      isDirect: direct.has(entry.name),
      parents: [...(parentsOf.get(entry.name) ?? [])].slice(0, 5),
      sourceChanged,
    };
    return analyze(entry, prev, ctx, opts, now);
  });

  const output =
    opts.format === 'json'
      ? JSON.stringify(
          { base: opts.base, lockfile: opts.lockfile, removed, results },
          null,
          2,
        )
      : toMarkdown(results, removed, opts);
  process.stdout.write(`${output}\n`);
  const blocking = results.some(r => r.flags.some(([sev]) => sev === 'blocking'));
  process.exitCode = blocking ? 1 : 0;
}

try {
  await main();
} catch (error) {
  process.stderr.write(`dep-risk-report: ${error.message}\n`);
  process.exitCode = 2;
}
