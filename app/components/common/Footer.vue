<script setup lang="ts">
import { QQ_GROUP_URL } from '~/data/community'

const community = [
  { name: 'Bilibili', icon: 'bilibili', href: 'https://space.bilibili.com/1079503056' },
  { name: 'Discord', icon: 'discord', href: 'https://discord.gg/pdXvp89Dbp' },
  { name: 'GitHub', icon: 'github', href: 'https://github.com/CycloneClub/Everglow' },
] as const
</script>

<template>
  <footer
    id="site-footer"
    class="common-footer"
  >
    <div class="footer-container">
      <div class="footer-main">
        <NuxtLinkLocale
          class="footer-logo"
          to="/"
          :aria-label="`${$t('body.header.name')} · ${$t('body.header.home')}`"
        >
          <img
            src="/images/hero/menu/logo.png"
            width="584"
            height="392"
            alt="Everglow"
            loading="lazy"
          >
        </NuxtLinkLocale>

        <div class="footer-links">
          <ul class="footer-contact">
            <li
              v-for="link in community"
              :key="link.name"
            >
              <a
                :href="link.href"
                :aria-label="link.name"
                :title="link.name"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HomeBrandIcon
                  :name="link.icon"
                  aria-hidden="true"
                />
              </a>
            </li>
            <li class="footer-qq">
              <a
                :href="QQ_GROUP_URL"
                :aria-label="$t('home.community.qq')"
                :title="$t('home.community.qq')"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HomeBrandIcon
                  name="qq"
                  aria-hidden="true"
                />
              </a>
            </li>
          </ul>
          <a
            class="footer-email"
            href="mailto:contact@everglowmod.com"
          >contact@everglowmod.com</a>
        </div>
      </div>

      <div
        class="footer-legal"
        lang="en"
        data-nosnippet
      >
        <p>© 2026 Dream Chaser Group. All rights reserved.</p>
        <p>
          The official website of the Everglow Mod for
          <a
            href="https://terraria.org/"
            target="_blank"
            rel="noopener noreferrer"
          >Terraria</a>.
          Terraria and all its content is copyrighted by Re-Logic.
        </p>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.common-footer {
  padding-top: 40px;
  color: #b6c0d4;
  background-color: #080e1b;

  a {
    color: inherit;
    text-decoration: none;
    transition: color 160ms ease;

    &:hover { color: #f1e5ff; }

    &:focus-visible {
      outline: 2px solid #c6a3fa;
      outline-offset: 3px;
    }
  }
}

.footer-container {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 32px;
}

.footer-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  padding: 28px 0;
}

.footer-logo {
  flex: 0 0 144px;

  img {
    display: block;
    width: 100%;
    height: auto;
    image-rendering: pixelated;
  }
}

.footer-legal {
  display: grid;
  gap: 4px;
  padding: 20px 0 80px;
  border-top: 1px solid #b6c0d41a;
  color: #8e9bb2;
  font-size: 1rem;
  line-height: 1.8;
  text-align: center;

  a {
    text-decoration: underline;
    text-decoration-color: #b6c0d44d;
    text-underline-offset: 3px;
  }
}

.footer-links {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 0;
  max-width: 100%;

  .footer-email {
    padding: 10px 0;
    min-height: 44px;
    color: #8e9bb2;
    font-size: 1.167rem;
    font-weight: var(--font-weight--light);
    line-height: 1.7;
    overflow-wrap: anywhere;
    text-decoration: underline;
    text-decoration-color: #8e9bb280;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
  }
}

.footer-contact {
  display: flex;
  flex-shrink: 0;
  gap: 2px;

  a {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 44px;
    height: 44px;
  }

  .iconify { font-size: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .common-footer a { transition: none; }
}
</style>
