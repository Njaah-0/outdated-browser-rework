import code from 'app';
import './outdated-browser-rework.scss';

function outdatedBrowser(options, onload) {
  code(options, onload);
}
window.outdatedBrowser = outdatedBrowser;