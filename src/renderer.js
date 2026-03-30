marked.use({ breaks: true })

let pairs = []
let currentIndex = 0
let folderPath = null

// DOM refs
const btnOpen = document.getElementById('btn-open')
const folderNameEl = document.getElementById('folder-name')
const welcome = document.getElementById('welcome')
const panels = document.getElementById('panels')
const navBar = document.getElementById('nav-bar')
const mangaImage = document.getElementById('manga-image')
const noImage = document.getElementById('no-image')
const markdownContent = document.getElementById('markdown-content')
const noMarkdown = document.getElementById('no-markdown')
const btnPrev = document.getElementById('btn-prev')
const btnNext = document.getElementById('btn-next')
const currentStemEl = document.getElementById('current-stem')
const currentPageEl = document.getElementById('current-page')
const pageInputEl = document.getElementById('page-input')
const totalPagesEl = document.getElementById('total-pages')

async function loadFolder(selectedPath, startIndex = 0) {
  folderPath = selectedPath
  folderNameEl.textContent = selectedPath.split('/').pop() || selectedPath
  pairs = await window.api.getPairs(selectedPath)
  if (pairs.length === 0) {
    welcome.querySelector('p').textContent = '该文件夹中未找到图片或 Markdown 文件'
    return
  }
  currentIndex = 0
  totalPagesEl.textContent = pairs.length
  showUI()
  renderPair(Math.min(startIndex, pairs.length - 1))
}

// Open folder
btnOpen.addEventListener('click', async () => {
  const selected = await window.api.openFolder()
  if (!selected) return
  loadFolder(selected, 0)
})

// Restore last session
;(async () => {
  const savedPath = localStorage.getItem('lastFolderPath')
  const savedIndex = parseInt(localStorage.getItem('lastPageIndex') || '0', 10)
  if (savedPath) {
    await loadFolder(savedPath, savedIndex)
  }
})()

function showUI() {
  welcome.classList.add('hidden')
  panels.classList.remove('hidden')
  navBar.classList.remove('hidden')
}

async function renderPair(index) {
  const pair = pairs[index]
  currentIndex = index
  currentStemEl.textContent = pair.stem
  currentPageEl.textContent = index + 1
  btnPrev.disabled = index === 0
  btnNext.disabled = index === pairs.length - 1

  // Image
  if (pair.imagePath) {
    const url = await window.api.getImageUrl(pair.imagePath)
    mangaImage.src = url
    mangaImage.classList.remove('hidden')
    noImage.classList.add('hidden')
  } else {
    mangaImage.classList.add('hidden')
    noImage.classList.remove('hidden')
  }

  // Markdown
  if (pair.markdownPath) {
    const md = await window.api.readMarkdown(pair.markdownPath)
    if (md !== null) {
      markdownContent.innerHTML = marked.parse(md)
      markdownContent.classList.remove('hidden')
      noMarkdown.classList.add('hidden')
      // Scroll markdown panel to top
      document.getElementById('markdown-panel').scrollTop = 0
    } else {
      markdownContent.classList.add('hidden')
      noMarkdown.classList.remove('hidden')
    }
  } else {
    markdownContent.classList.add('hidden')
    noMarkdown.classList.remove('hidden')
  }

  // Preload adjacent images
  preload(index - 1)
  preload(index + 1)

  // Save session
  if (folderPath) {
    localStorage.setItem('lastFolderPath', folderPath)
    localStorage.setItem('lastPageIndex', index)
  }
}

function preload(index) {
  if (index < 0 || index >= pairs.length || !pairs[index].imagePath) return
  window.api.getImageUrl(pairs[index].imagePath).then(url => {
    const img = new Image()
    img.src = url
  })
}

function goTo(index) {
  if (index < 0 || index >= pairs.length) return
  renderPair(index)
}

btnPrev.addEventListener('click', () => goTo(currentIndex - 1))
btnNext.addEventListener('click', () => goTo(currentIndex + 1))

// Jump to page
currentPageEl.addEventListener('click', () => {
  pageInputEl.value = currentIndex + 1
  pageInputEl.max = pairs.length
  currentPageEl.classList.add('hidden')
  pageInputEl.classList.remove('hidden')
  pageInputEl.focus()
  pageInputEl.select()
})

function commitPageInput() {
  const val = parseInt(pageInputEl.value, 10)
  pageInputEl.classList.add('hidden')
  currentPageEl.classList.remove('hidden')
  if (!isNaN(val)) goTo(Math.max(1, Math.min(val, pairs.length)) - 1)
}

pageInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') commitPageInput()
  if (e.key === 'Escape') {
    pageInputEl.classList.add('hidden')
    currentPageEl.classList.remove('hidden')
  }
  e.stopPropagation()
})

pageInputEl.addEventListener('blur', commitPageInput)

document.addEventListener('keydown', (e) => {
  if (pairs.length === 0) return
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'j') {
    goTo(currentIndex + 1)
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'k') {
    goTo(currentIndex - 1)
  } else if (e.key === 'Home') {
    goTo(0)
  } else if (e.key === 'End') {
    goTo(pairs.length - 1)
  }
})
