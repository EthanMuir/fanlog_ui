import { computeFanScore } from '../src/data/fanScore.js';
import { expect, tab, test } from './fixtures.js';

test.describe('the default demo', () => {
  test('opens on the feed with the sample fan', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Matchday Updates')).toBeVisible();
    await expect(page.getByText('Final: Maple Leafs 4, Bruins 2')).toBeVisible();
    // A filter chip per team, plus "All Teams"
    for (const name of ['All Teams', 'Maple Leafs', 'Bills', 'Blue Jays', 'Raptors']) {
      await expect(page.getByRole('button', { name, exact: true })).toBeVisible();
    }
  });

  test('every tab opens', async ({ page }) => {
    await page.goto('/');
    await tab(page, 'Chat').click();
    await expect(page.getByText('Fan Rooms')).toBeVisible();
    await tab(page, 'Log').click();
    await expect(page.getByText('Log Center')).toBeVisible();
    await tab(page, 'Profile').click();
    await expect(page.getByText('Ethan Henderson')).toBeVisible();
    await tab(page, 'Feed').click();
    await expect(page.getByText('Matchday Updates')).toBeVisible();
  });
});

test.describe('customised by the landing page', () => {
  const qs = new URLSearchParams({ name: 'Sam Rivers', handle: '@sam_r', favorites: 'arsenal,bills', scores: '81,40' });

  test("shows the visitor's own teams, name and FanLog Score", async ({ page }) => {
    await page.goto(`/?${qs}`);
    await expect(page.getByText('Final: Arsenal 4, Liverpool 2')).toBeVisible();
    await expect(page.getByText('2nd Half - 84:10')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bills', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Maple Leafs', exact: true })).toHaveCount(0);

    await tab(page, 'Profile').click();
    await expect(page.getByRole('heading', { name: 'Sam Rivers' })).toBeVisible();
    await expect(page.getByText('@sam_r', { exact: true })).toBeVisible();
    await expect(page.getByText('FANLOG SCORE').locator('..').locator('span').first()).toHaveText(String(computeFanScore([81, 40])));
  });

  test('a link with unknown teams falls back to the sample fan instead of breaking', async ({ page }) => {
    await page.goto('/?favorites=toString,__proto__,nope&scores=1,2,3&name=%3Cb%3Ex');
    await expect(page.getByText('Final: Maple Leafs 4, Bruins 2')).toBeVisible();
    await tab(page, 'Profile').click();
    await expect(page.getByRole('heading', { name: '<b>x' })).toBeVisible();
    // The avatar is still a valid image
    const ok = await page.locator('img[alt="<b>x"]').evaluate((img) => img.complete && img.naturalWidth > 0);
    expect(ok).toBe(true);
  });

  test('a team from each league gets a same-league matchup', async ({ page }) => {
    for (const [id, match] of [
      ['argonauts', 'Argonauts 4, Tiger-Cats 2'],
      ['real_madrid', 'Real Madrid 4, Barcelona 2'],
      ['bayern', 'Bayern 4, Dortmund 2'],
      ['psg', 'PSG 4, Marseille 2'],
      ['juventus', 'Juventus 4, Inter 2'],
    ]) {
      await page.goto(`/?favorites=${id}`);
      await expect(page.getByText(`Final: ${match}`)).toBeVisible();
    }
  });
});

test.describe('the feed', () => {
  test('filters by team', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Raptors linked to star players in latest trade rumors')).toBeVisible();
    await page.getByRole('button', { name: 'Bills', exact: true }).click();
    await expect(page.getByText('Bills linked to star players in latest trade rumors')).toBeVisible();
    await expect(page.getByText('Raptors linked to star players in latest trade rumors')).toBeHidden();
    await expect(page.getByText('Final: Maple Leafs 4, Bruins 2')).toBeHidden();
    await page.getByRole('button', { name: 'All Teams' }).click();
    await expect(page.getByText('Final: Maple Leafs 4, Bruins 2')).toBeVisible();
  });

  test('likes toggle', async ({ page }) => {
    await page.goto('/');
    const like = page.getByRole('button', { name: '215' });
    await like.click();
    await expect(page.getByRole('button', { name: '216' })).toBeVisible();
    await page.getByRole('button', { name: '216' }).click();
    await expect(page.getByRole('button', { name: '215' })).toBeVisible();
  });

  test('"Join Live Match Chat" opens the live room', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Join Live Match Chat' }).click();
    // The open room's header (the room list stays rendered underneath)
    await expect(page.getByText('Match Chat • 1420 online')).toBeVisible();
    await expect(page.getByText('Match Chat • 1420 online').locator('xpath=../../h3')).toHaveText('Maple Leafs vs Bruins - Live Chat');
    await expect(page.getByPlaceholder('Say something to the room...')).toBeVisible();
  });
});

test.describe('chat', () => {
  test('sends a message and gets a reply', async ({ page }) => {
    await page.goto('/');
    await tab(page, 'Chat').click();
    await page.getByText('Bills Nation Banter').click();
    const input = page.getByPlaceholder('Say something to the room...');
    const send = page.getByRole('button', { name: 'Send message' });
    await expect(send).toBeDisabled();
    await input.fill('   ');
    await expect(send).toBeDisabled();
    await input.fill('Go Bills!');
    await send.click();
    await expect(input).toHaveValue('');
    // The room list stays rendered under the open room, so look in the thread
    const thread = page.locator('div.overflow-y-auto', { hasText: 'Fandom Room Started' });
    await expect(thread.getByText('Go Bills!', { exact: true })).toBeVisible();
    // A fan replies a moment later
    const replies = [
      'Agreed! What a play that was!',
      'No way, that was clearly a penalty!',
      "Let's gooooo! This game is insane!",
      'I am literally on the edge of my seat right now.',
      'Wait, did you guys see the replay? Incredible.',
      'This team is giving me grey hairs, but I love them.',
    ];
    await expect(thread.locator('div.rounded-2xl')).toHaveCount(4, { timeout: 5000 });
    expect(replies).toContain(await thread.locator('div.rounded-2xl').last().textContent());

    // Back on the list, the room shows the latest message
    await page.getByRole('button', { name: 'Back to rooms' }).click();
    await expect(page.getByText('Fan Rooms')).toBeVisible();
  });

  test('Enter sends too', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Join Live Match Chat' }).click();
    await page.getByPlaceholder('Say something to the room...').fill('What a game');
    await page.keyboard.press('Enter');
    const thread = page.locator('div.overflow-y-auto', { hasText: 'Fandom Room Started' });
    await expect(thread.getByText('What a game', { exact: true })).toBeVisible();
  });
});

test.describe('logging a game', () => {
  test('rate, pick what you watched, add notes and save', async ({ page }) => {
    await page.goto('/');
    await tab(page, 'Log').click();
    await expect(page.getByRole('button', { name: 'To Log (4)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logged (4)' })).toBeVisible();

    await page.getByText('Maple Leafs vs Bruins').click();
    await expect(page.getByText('Journal Review')).toBeVisible();
    const save = page.getByRole('button', { name: 'Log Game Review' });
    await expect(save).toBeDisabled();

    // Every period starts selected; untick one
    await expect(page.getByText('Periods Watched')).toBeVisible();
    for (const p of ['1st', '2nd', '3rd', 'OT']) await expect(page.getByRole('button', { name: p, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'OT', exact: true }).click();
    await expect(page.getByRole('button', { name: 'OT', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: 'Select All' })).toBeVisible();

    await page.getByRole('button', { name: 'Rate 4 stars' }).click();
    await expect(page.getByRole('button', { name: 'Rate 4 stars' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Rate 5 stars' })).toHaveAttribute('aria-pressed', 'false');
    await page.getByPlaceholder('Enter notes, highlight plays, thoughts on the game, etc...').fill('Huge third period comeback');
    await expect(save).toBeEnabled();
    await save.click();

    await expect(page.getByText('Review Saved!')).toBeVisible();
    // Then it lands on the history, newest first
    await expect(page.getByRole('button', { name: 'Logged (5)' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'To Log (3)' })).toBeVisible();
    await expect(page.getByText('Huge third period comeback')).toBeVisible();
    await expect(page.getByText('Just now')).toBeVisible();
    await expect(page.getByText('1st, 2nd, 3rd').first()).toBeVisible();
  });

  test('logging every game shows "All caught up!"', async ({ page }) => {
    test.slow();
    await page.goto('/?favorites=leafs');
    await tab(page, 'Log').click();
    await page.getByText('Maple Leafs vs Bruins').click();
    await page.getByRole('button', { name: 'Rate 5 stars' }).click();
    await page.getByRole('button', { name: 'Log Game Review' }).click();
    await expect(page.getByRole('button', { name: 'Logged (2)' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'To Log (0)' }).click();
    await expect(page.getByText('All caught up!')).toBeVisible();
  });

  test('backing out keeps the game to log', async ({ page }) => {
    await page.goto('/');
    await tab(page, 'Log').click();
    await page.getByText('Bills vs Chiefs').click();
    await expect(page.getByText('Quarters Watched')).toBeVisible();
    await page.getByRole('button', { name: 'Back to games' }).click();
    await expect(page.getByText('Journal Review')).toBeHidden();
    await expect(page.getByRole('button', { name: 'To Log (4)' })).toBeVisible();
  });

  test('the profile counts the new log', async ({ page }) => {
    const stat = (label) => page.getByText(label, { exact: true }).locator('xpath=preceding-sibling::span');
    for (const favorites of ['', 'leafs']) {
      await page.goto(`/?favorites=${favorites}`);
      await tab(page, 'Profile').click();
      // The baseline stats, whatever the number of teams
      await expect(stat('Games Watched')).toHaveText('147');
      await expect(stat('Total Hours')).toHaveText('382h');
      await expect(stat('Logged This Month')).toHaveText('14');
    }
    await tab(page, 'Log').click();
    await page.getByText('Maple Leafs vs Bruins').click();
    await page.getByRole('button', { name: 'Rate 3 stars' }).click();
    await page.getByRole('button', { name: 'Log Game Review' }).click();
    await expect(page.getByRole('button', { name: 'Logged (2)' })).toBeVisible({ timeout: 5000 });
    await tab(page, 'Profile').click();
    await expect(stat('Games Watched')).toHaveText('148');
    await expect(stat('Total Hours')).toHaveText('384h');
    await expect(stat('Logged This Month')).toHaveText('15');
  });


});
