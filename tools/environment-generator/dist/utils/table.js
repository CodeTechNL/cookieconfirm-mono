import Table from 'cli-table3';
import chalk from 'chalk';
// Insert hard line breaks every N characters to avoid breaking table layout for very long values
function hardWrap(str, limit = 25) {
    if (!str)
        return '';
    const out = [];
    for (let i = 0; i < str.length; i += limit) {
        out.push(str.slice(i, i + limit));
    }
    return out.join('\n');
}
export function renderOverviewTable(rows) {
    const table = new Table({
        head: ['#', 'Key', 'SSM', 'ENV', 'Status'],
        style: { head: ['cyan'] },
    });
    rows.forEach((r, idx) => {
        const statusColored = r.status === 'same'
            ? chalk.dim('same')
            : r.status === 'diff'
                ? chalk.yellow('diff')
                : r.status === 'only-env'
                    ? chalk.green('only-env')
                    : chalk.magenta('only-ssm');
        const ssmWrapped = r.ssm !== undefined ? hardWrap(r.ssm) : '';
        const envWrapped = r.env !== undefined ? hardWrap(r.env) : '';
        const ssmVal = ssmWrapped ? chalk.cyan(ssmWrapped) : chalk.dim('');
        const envVal = envWrapped ? chalk.green(envWrapped) : chalk.dim('');
        table.push([chalk.gray(String(idx + 1)), r.key, ssmVal, envVal, statusColored]);
    });
    return table.toString();
}
export function renderPlannedChangesTable(rows) {
    const table = new Table({
        head: ['#', 'Key', 'From', 'To', 'Action'],
        style: { head: ['green'] },
    });
    rows.forEach((r, idx) => {
        const actionColored = r.action === 'create' ? chalk.green('create') : chalk.yellow('update');
        const fromWrapped = r.from !== undefined ? hardWrap(r.from) : '';
        const toWrapped = hardWrap(r.to);
        const fromVal = fromWrapped ? chalk.dim(fromWrapped) : chalk.dim('');
        const toVal = chalk.bold(toWrapped);
        table.push([chalk.gray(String(idx + 1)), r.key, fromVal, toVal, actionColored]);
    });
    return table.toString();
}
