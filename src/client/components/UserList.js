export class UserList {
  constructor(users, onUserSelect) {
    this.users = users;
    this.onUserSelect = onUserSelect;
  }

  renderUserDetails(selectedUserId) {
    const selectedUser = this.users.find((user) => user._id === selectedUserId);
    if (!selectedUser) return;

    const selectedUserDisplay = document.getElementById("selected-user");
    if (!selectedUserDisplay) return;

    selectedUserDisplay.innerHTML = `
      <div class="user-item" data-id="${selectedUser._id}">
        <div class="user-avatar">${selectedUser.username[0].toUpperCase()}</div>
        <div class="user-info">
          <span class="user-name">${selectedUser.username}</span>
          <span class="last-seen">Last seen: ${new Date(
            selectedUser.lastSeen
          ).toLocaleString()}</span>
        </div>
      </div>
    `;
  }

  render() {
    const usersList = document.createElement("div");
    usersList.className = "users-list";
    usersList.innerHTML = this.users
      .map(
        (user) => `
        <div class="user-item" data-id="${user._id}">
          <div class="user-avatar">${user.username[0].toUpperCase()}</div>
          <div class="user-info">
            <span class="user-name">${user.username}</span>
            <span class="last-seen">Last seen: ${new Date(
              user.lastSeen
            ).toLocaleString()}</span>
          </div>
        </div>
      `
      )
      .join("");

    // Attach event listeners to each user item
    usersList.querySelectorAll(".user-item").forEach((item) => {
      item.addEventListener("click", () => {
        const selectedUserId = item.dataset.id;
        this.onUserSelect(selectedUserId);
        this.renderUserDetails(selectedUserId);
      });
    });

    return usersList;
  }
}
