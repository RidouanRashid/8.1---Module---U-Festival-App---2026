<template>
  <div class="info-view">
    <h1 class="page-title">{{ $t('info.title') }}</h1>

    <div class="accordion">
      <div
        v-for="section in sections"
        :key="section.id"
        class="accordion-item"
      >
        <button
          class="accordion-header"
          :class="{ open: openSections[section.id] }"
          @click="toggle(section.id)"
          :aria-expanded="openSections[section.id]"
          :aria-controls="'section-' + section.id"
        >
          <span class="accordion-title">{{ section.title }}</span>
          <span class="material-icons accordion-icon">expand_more</span>
        </button>

        <div
          :id="'section-' + section.id"
          class="accordion-body"
          :class="{ open: openSections[section.id] }"
          role="region"
        >
          <div class="accordion-content">
            <!-- Simple content -->
            <p v-if="section.content" class="info-text" v-html="formatContent(section.content)"></p>

            <!-- Subsections (transport) -->
            <div v-if="section.subsections" class="subsections">
              <div v-for="(sub, idx) in section.subsections" :key="idx" class="subsection">
                <h3 class="subsection-title">{{ sub.title }}</h3>
                <p class="info-text">{{ sub.content }}</p>
              </div>
            </div>

            <!-- FAQ -->
            <div v-if="section.questions" class="faq-list">
              <div v-for="(q, idx) in section.questions" :key="idx" class="faq-item">
                <button
                  class="faq-question"
                  :class="{ open: openFaqs[section.id + '-' + idx] }"
                  @click="toggleFaq(section.id + '-' + idx)"
                  :aria-expanded="openFaqs[section.id + '-' + idx]"
                >
                  <span>{{ q.question }}</span>
                  <span class="material-icons faq-icon">expand_more</span>
                </button>
                <div class="faq-answer" :class="{ open: openFaqs[section.id + '-' + idx] }">
                  <p class="info-text">{{ q.answer }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import infoData from '../assets/data/info.json'

const { locale } = useI18n()

const sections = computed(() => {
  const data = infoData[locale.value] || infoData.nl
  return data.sections
})

const openSections = reactive({})
const openFaqs = reactive({})

function toggle(id) {
  openSections[id] = !openSections[id]
}

function toggleFaq(id) {
  openFaqs[id] = !openFaqs[id]
}

function formatContent(content) {
  return content.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.info-view {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.page-title {
  margin-bottom: calc(var(--spacing) * 3);
}

.accordion {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
}

.accordion-item {
  background: var(--color-surface);
  border-radius: var(--radius);
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: calc(var(--spacing) * 2);
  font-weight: 700;
  font-style: normal;
  font-size: 1rem;
  min-height: 44px;
  text-align: left;
  transition: background-color 0.2s ease;
}

.accordion-header:hover {
  background: var(--color-border);
}

.accordion-header:active {
  transform: scale(0.99);
}

.accordion-title {
  color: var(--color-secondary);
  flex: 1;
}

.accordion-icon {
  color: var(--color-text-muted);
  transition: transform 0.3s ease;
  font-size: 24px;
}

.accordion-header.open .accordion-icon {
  transform: rotate(180deg);
}

.accordion-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.accordion-body.open {
  max-height: 2000px;
}

.accordion-content {
  padding: 0 calc(var(--spacing) * 2) calc(var(--spacing) * 2);
}

.info-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-text-muted);
}

.subsections {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}

.subsection-title {
  font-size: 0.95rem;
  color: var(--color-accent);
  margin-bottom: calc(var(--spacing) / 2);
}

/* FAQ nested accordion */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
}

.faq-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: calc(var(--spacing) * 1.5);
  font-weight: 700;
  font-style: normal;
  font-size: 0.9rem;
  text-align: left;
  min-height: 44px;
  gap: var(--spacing);
}

.faq-icon {
  font-size: 20px;
  color: var(--color-text-muted);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.faq-question.open .faq-icon {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-answer.open {
  max-height: 500px;
}

.faq-answer .info-text {
  padding: 0 calc(var(--spacing) * 1.5) calc(var(--spacing) * 1.5);
}
</style>
