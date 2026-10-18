'use strict';

document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const mobileQuery = window.matchMedia('(max-width: 540px)');

function closeMenu(returnFocus = false) {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = '+';
  navigation.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  if (returnFocus) menuButton.focus();
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    if (isOpen) return closeMenu();
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.querySelector('span').textContent = '−';
    navigation.classList.add('is-open');
    document.body.classList.add('menu-open');
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  mobileQuery.addEventListener('change', () => {
    if (!mobileQuery.matches) closeMenu();
  });
}

const mechanism = document.querySelector('.mechanism');
const switcher = document.querySelector('.view-switch');
if (mechanism && switcher) {
  switcher.hidden = false;
  document.querySelector('#diagram-inside').hidden = true;
  switcher.addEventListener('click', (event) => {
    const button = event.target.closest('[data-view]');
    if (!button) return;
    const view = button.dataset.view;
    if (!['inside', 'outside'].includes(view)) return;
    mechanism.dataset.mode = view;
    switcher.querySelectorAll('[data-view]').forEach((control) => {
      control.setAttribute('aria-pressed', String(control === button));
    });
    document.querySelector('#diagram-outside').hidden = view !== 'outside';
    document.querySelector('#diagram-inside').hidden = view !== 'inside';
  });
}

const agentButtons = document.querySelectorAll('[data-agent-stage]');
const agentPanels = document.querySelectorAll('.agent-explanation');
if (agentButtons.length && agentPanels.length) {
  function selectAgentStage(button) {
    const targetId = button.getAttribute('aria-controls');
    agentButtons.forEach((control) => control.setAttribute('aria-pressed', String(control === button)));
    agentPanels.forEach((panel) => { panel.hidden = panel.id !== targetId; });
  }
  agentButtons.forEach((button) => {
    button.disabled = false;
    button.addEventListener('click', () => selectAgentStage(button));
  });
  selectAgentStage(agentButtons[0]);
  document.querySelector('.agent-invitation').hidden = false;
}
