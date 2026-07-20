import { execSync } from 'child_process';
import fs from 'fs';

function sh(cmd, input) {
  return execSync(cmd, {
    input,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'ZAX-MILLION',
      GIT_AUTHOR_EMAIL: 'ZAXMIllion@proton.me',
      GIT_COMMITTER_NAME: 'ZAX-MILLION',
      GIT_COMMITTER_EMAIL: 'ZAXMIllion@proton.me',
    },
  }).trim();
}

function commit(message) {
  const tree = sh('git write-tree');
  const parent = sh('git rev-parse HEAD');
  const commit = sh(`git commit-tree ${tree} -p ${parent}`, message.endsWith('\n') ? message : message + '\n');
  sh(`git reset --hard ${commit}`);
  const body = sh('git log -1 --format=%B');
  if (/Co-authored-by|cursoragent@cursor\.com/i.test(body)) {
    throw new Error('Commit unexpectedly contains AI co-author trailer:\n' + body);
  }
  console.log('CREATED', commit);
  console.log(body);
  return commit;
}

// Ensure clean index then stage feat files
sh('git reset');
sh(
  'git add src supabase tests scripts package.json package-lock.json vite.config.ts vite.seo-plugin.ts vitest.config.ts tsconfig.node.json public .env.example .github'
);
const c1 = commit(
  'feat: implement ZAX Seamless V2 platform upgrade\n\nShip the public homepage structure, Role Lab simulations, env-aware SEO,\npayment catalogue hardening, and supporting tests for the Seamless V2 release.\n'
);

sh('git add docs README.md');
try {
  sh('git add -u docs');
} catch {}
const c2 = commit(
  'docs: add deployment and security runbooks\n\nAdd release verification materials, operator runbooks, architecture notes,\nand README guidance for the future GitHub Pages root URL.\n'
);

console.log('DONE', { c1, c2 });
console.log(sh('git log --oneline main..HEAD'));
