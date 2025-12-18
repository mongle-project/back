//update article

const updateArticle = async (articleId, updateData) => {
  const fields = [];
  const values = [];

  //update query
  if (updateData.title !== undefined) {
    fields.push("title = ?");
    values.push(updateData.title);
  }
  if (updateData.content !== undefined) {
    fields.push("content = ?");
    values.push(updateData.content);
  }
  if (updateData.category !== undefined) {
    fields.push("category = ?");
    values.push(updateData.category);
  }
  if (updateData.img_url !== undefined) {
    fields.push("img_url = ?");
    values.push(updateData.img_url);
  }

  if (fields.length === 0) return;

  const query = `UPDATE articles SET ${fields.join(", ")} WHERE id = ?;`;
  values.push(articleId);

  await db.execute(query, values);
};
//delete article
const deleteArticle = async (articleId) => {
  const query = "DELETE FROM articles WHERE id = ?";
  await db.execute(query, [articleId]);
};

export default {
  updateArticle,
  deleteArticle,
};
