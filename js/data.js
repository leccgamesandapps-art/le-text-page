// Text pages + comments store (localStorage demo)

const PAGES_KEY = "le_text_pages";
const COMMENTS_KEY = "le_text_comments";

function getPages() {
  try {
    const raw = localStorage.getItem(PAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePages(pages) {
  localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
}

function createPage({ title, content, userId, username, files = [] }) {
  const pages = getPages();
  const textId = "t_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  const page = {
    textId,
    userId,
    username,
    title: title || "Untitled",
    content: content || "",
    files,
    createdAt: new Date().toISOString(),
    likes: []
  };
  pages.unshift(page);
  savePages(pages);
  return page;
}

function getPage(textId) {
  return getPages().find(p => p.textId === textId) || null;
}

function getPublicPages() {
  return getPages();
}

function getUserPages(userId) {
  return getPages().filter(p => p.userId === userId);
}

function getComments(textId) {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[textId] || [];
  } catch {
    return [];
  }
}

function saveComments(textId, comments) {
  try {
    const raw = localStorage.getItem(COMMENTS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[textId] = comments;
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
  } catch (e) {
    console.error(e);
  }
}

function addComment({ textId, userId, username, content, parentId = null, files = [] }) {
  const comments = getComments(textId);
  const comment = {
    commentId: "c_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    textId,
    userId,
    username,
    content,
    parentId,
    files,
    likes: [],
    createdAt: new Date().toISOString()
  };
  comments.push(comment);
  saveComments(textId, comments);
  return comment;
}

function toggleLikeComment(textId, commentId, userId) {
  const comments = getComments(textId);
  const c = comments.find(x => x.commentId === commentId);
  if (!c) return;
  const idx = c.likes.indexOf(userId);
  if (idx === -1) c.likes.push(userId);
  else c.likes.splice(idx, 1);
  saveComments(textId, comments);
  return c;
}

function toggleLikePage(textId, userId) {
  const pages = getPages();
  const p = pages.find(x => x.textId === textId);
  if (!p) return;
  if (!p.likes) p.likes = [];
  const idx = p.likes.indexOf(userId);
  if (idx === -1) p.likes.push(userId);
  else p.likes.splice(idx, 1);
  savePages(pages);
  return p;
}

function readFilesAsDataUrls(fileList) {
  return Promise.all(
    Array.from(fileList).map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: reader.result
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })
  );
}
