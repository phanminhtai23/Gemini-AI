let isNavOpen = false; // Biến trạng thái xác định thanh bên đang mở hay đó

function toggleNav() {
	if (isNavOpen) {
		// ẩn togger chính và hiển thị toggle phụ
		document.getElementById('mySidenav').style.width = '0px';
		document.getElementById('main').style.marginLeft = '0px';
		document.querySelector('.top-side-main').style.display = 'flex';
	} else {
		document.querySelector('.top-side-main').style.display = 'none';
		document.getElementById('mySidenav').style.width = '250px';
		document.getElementById('main').style.marginLeft = '250px';
	}
	isNavOpen = !isNavOpen; // Đổi trạng thái
}

export { isNavOpen, toggleNav }; // Export function toggleNav
