local function wrapAtom(read, write)
	local function atomOper(...)
		return if select("#", ...) == 0 then read() else write((...))
	end

	return atomOper
end

return {
	wrapAtom = wrapAtom,
}
